import { ModelProvider, Tool, Message } from '@ai-ide/model-provider';
import { Task } from './types';
import { ArtifactStore } from '@ai-ide/artifact-system';
import { AGENT_SYSTEM_PROMPT } from './prompts';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ToolResult {
	success: boolean;
	output: string;
	error?: string;
}

export class Executor {
	constructor(
		private modelProvider: ModelProvider,
		private artifactStore: ArtifactStore,
		private workspacePath: string = process.cwd()
	) { }

	async executeTask(task: Task, context: string, agentId: string = 'system'): Promise<void> {
		console.log(`Executing task: ${task.description}`);
		task.status = 'in_progress';

		const tools: Tool[] = this.getAvailableTools();
		const conversationHistory: Message[] = [
			{ role: 'system', content: AGENT_SYSTEM_PROMPT },
			{ role: 'user', content: `Task: ${task.description}\nContext: ${context}\n\nExecute this task using the available tools.` }
		];

		let maxTurns = 15;
		let turnCount = 0;

		while (turnCount < maxTurns) {
			turnCount++;

			// Call model with tool support
			let response;
			if (this.modelProvider.toolCall) {
				response = await this.modelProvider.toolCall(conversationHistory, tools);
			} else {
				// Fallback for models without native tool calling
				response = await this.modelProvider.generate(
					conversationHistory[conversationHistory.length - 1].content,
					{ systemPrompt: AGENT_SYSTEM_PROMPT }
				);
			}

			conversationHistory.push({ role: 'assistant', content: response.content });

			// Check if task is complete
			if (response.content.toLowerCase().includes('task complete') ||
				response.content.toLowerCase().includes('task_complete')) {
				break;
			}

			// Execute tool calls
			if (response.toolCalls && response.toolCalls.length > 0) {
				for (const toolCall of response.toolCalls) {
					const result = await this.executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));

					conversationHistory.push({
						role: 'user',
						content: `Tool ${toolCall.function.name} result: ${JSON.stringify(result)}`
					});

					// Create artifact for significant actions
					if (toolCall.function.name === 'write_file' && result.success) {
						await this.artifactStore.createArtifact({
							agentId,
							taskId: task.id,
							type: 'code_diff',
							title: `Modified ${path.basename(JSON.parse(toolCall.function.arguments).path)}`,
							content: {
								path: JSON.parse(toolCall.function.arguments).path,
								newCode: JSON.parse(toolCall.function.arguments).content
							},
							metadata: { timestamp: new Date() },
							status: 'completed'
						});
					}
				}
			}
		}

		task.status = 'completed';
	}

	private getAvailableTools(): Tool[] {
		return [
			{
				name: 'read_file',
				description: 'Read the contents of a file',
				parameters: {
					type: 'object',
					properties: {
						path: { type: 'string', description: 'Path to the file' }
					},
					required: ['path']
				}
			},
			{
				name: 'write_file',
				description: 'Write content to a file',
				parameters: {
					type: 'object',
					properties: {
						path: { type: 'string', description: 'Path to the file' },
						content: { type: 'string', description: 'Content to write' }
					},
					required: ['path', 'content']
				}
			},
			{
				name: 'list_directory',
				description: 'List contents of a directory',
				parameters: {
					type: 'object',
					properties: {
						path: { type: 'string', description: 'Path to directory' }
					},
					required: ['path']
				}
			},
			{
				name: 'execute_command',
				description: 'Execute a shell command',
				parameters: {
					type: 'object',
					properties: {
						command: { type: 'string', description: 'Command to execute' },
						cwd: { type: 'string', description: 'Working directory' }
					},
					required: ['command']
				}
			},
			{
				name: 'search_files',
				description: 'Search for text in files',
				parameters: {
					type: 'object',
					properties: {
						pattern: { type: 'string', description: 'Search pattern' },
						directory: { type: 'string', description: 'Directory to search in' }
					},
					required: ['pattern']
				}
			}
		];
	}

	private async executeTool(toolName: string, args: any): Promise<ToolResult> {
		try {
			switch (toolName) {
				case 'read_file':
					return await this.readFile(args.path);

				case 'write_file':
					return await this.writeFile(args.path, args.content);

				case 'list_directory':
					return await this.listDirectory(args.path);

				case 'execute_command':
					return await this.executeCommand(args.command, args.cwd);

				case 'search_files':
					return await this.searchFiles(args.pattern, args.directory);

				default:
					return { success: false, output: '', error: `Unknown tool: ${toolName}` };
			}
		} catch (error: any) {
			return { success: false, output: '', error: error.message };
		}
	}

	private async readFile(filePath: string): Promise<ToolResult> {
		const fullPath = path.resolve(this.workspacePath, filePath);
		const content = await fs.readFile(fullPath, 'utf-8');
		return { success: true, output: content };
	}

	private async writeFile(filePath: string, content: string): Promise<ToolResult> {
		const fullPath = path.resolve(this.workspacePath, filePath);
		await fs.mkdir(path.dirname(fullPath), { recursive: true });
		await fs.writeFile(fullPath, content, 'utf-8');
		return { success: true, output: `File written to ${filePath}` };
	}

	private async listDirectory(dirPath: string): Promise<ToolResult> {
		const fullPath = path.resolve(this.workspacePath, dirPath);
		const entries = await fs.readdir(fullPath, { withFileTypes: true });
		const output = entries.map(e => `${e.isDirectory() ? '[DIR]' : '[FILE]'} ${e.name}`).join('\n');
		return { success: true, output };
	}

	private async executeCommand(command: string, cwd?: string): Promise<ToolResult> {
		const workDir = cwd ? path.resolve(this.workspacePath, cwd) : this.workspacePath;
		const { stdout, stderr } = await execAsync(command, { cwd: workDir });
		return {
			success: !stderr,
			output: stdout || stderr,
			error: stderr || undefined
		};
	}

	private async searchFiles(pattern: string, directory?: string): Promise<ToolResult> {
		const searchDir = directory ? path.resolve(this.workspacePath, directory) : this.workspacePath;
		// Simple grep-like search
		const { stdout } = await execAsync(`grep -r "${pattern}" "${searchDir}" || true`);
		return { success: true, output: stdout || 'No matches found' };
	}
}
