import * as vscode from 'vscode';
import { AgentService } from './AgentService';

interface CommentCommand {
	type: 'add' | 'fix' | 'refactor' | 'implement' | 'test';
	description: string;
	location: vscode.Range;
}

export class NaturalLanguageCommandParser {
	private commentPatterns = [
		{ regex: /\/\/\s*add\s+(.+)/i, type: 'add' as const },
		{ regex: /\/\/\s*fix\s+(.+)/i, type: 'fix' as const },
		{ regex: /\/\/\s*refactor\s+(.+)/i, type: 'refactor' as const },
		{ regex: /\/\/\s*implement\s+(.+)/i, type: 'implement' as const },
		{ regex: /\/\/\s*test\s+(.+)/i, type: 'test' as const },
		{ regex: /\/\/\s*TODO:\s*(.+)/i, type: 'implement' as const },
	];

	constructor(private agentService: AgentService) { }

	parseComment(line: string, lineNumber: number): CommentCommand | null {
		for (const pattern of this.commentPatterns) {
			const match = line.match(pattern.regex);
			if (match) {
				return {
					type: pattern.type,
					description: match[1].trim(),
					location: new vscode.Range(lineNumber, 0, lineNumber, line.length)
				};
			}
		}
		return null;
	}

	async executeCommand(
		command: CommentCommand,
		document: vscode.TextDocument
	): Promise<void> {
		const context = this.getContext(document, command.location);

		const goal = this.buildGoal(command, context);

		// Create agent to handle the command
		const agentId = await this.agentService.createAgent(goal, {
			name: `${command.type}: ${command.description.substring(0, 30)}`,
			workspacePath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
		});

		vscode.window.showInformationMessage(
			`Agent ${agentId} started: ${command.description}`
		);
	}

	private getContext(document: vscode.TextDocument, location: vscode.Range): string {
		// Get surrounding code context
		const startLine = Math.max(0, location.start.line - 10);
		const endLine = Math.min(document.lineCount - 1, location.end.line + 10);

		const contextLines = [];
		for (let i = startLine; i <= endLine; i++) {
			contextLines.push(document.lineAt(i).text);
		}

		return contextLines.join('\n');
	}

	private buildGoal(command: CommentCommand, context: string): string {
		const templates = {
			add: `Add ${command.description} to the code`,
			fix: `Fix ${command.description}`,
			refactor: `Refactor to ${command.description}`,
			implement: `Implement ${command.description}`,
			test: `Add tests for ${command.description}`
		};

		const baseGoal = templates[command.type];
		return `${baseGoal}\n\nContext:\n${context}`;
	}
}

export class NaturalLanguageCommandProvider {
	private parser: NaturalLanguageCommandParser;
	private decorationType: vscode.TextEditorDecorationType;

	constructor(agentService: AgentService) {
		this.parser = new NaturalLanguageCommandParser(agentService);

		// Create decoration for detected commands
		this.decorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('editor.findMatchHighlightBackground'),
			border: '1px solid',
			borderColor: new vscode.ThemeColor('editorInfo.foreground'),
			after: {
				contentText: ' ⚡ Click to execute',
				color: new vscode.ThemeColor('editorInfo.foreground'),
				margin: '0 0 0 1em'
			}
		});
	}

	activate(context: vscode.ExtensionContext) {
		// Watch for comment commands in active editor
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				this.detectCommands(editor);
			}
		});

		vscode.workspace.onDidChangeTextDocument(event => {
			const editor = vscode.window.activeTextEditor;
			if (editor && event.document === editor.document) {
				this.detectCommands(editor);
			}
		});

		// Register code action provider for quick fixes
		context.subscriptions.push(
			vscode.languages.registerCodeActionsProvider(
				{ scheme: 'file' },
				new NaturalLanguageCodeActionProvider(this.parser)
			)
		);
	}

	private detectCommands(editor: vscode.TextEditor) {
		const decorations: vscode.DecorationOptions[] = [];

		for (let i = 0; i < editor.document.lineCount; i++) {
			const line = editor.document.lineAt(i);
			const command = this.parser.parseComment(line.text, i);

			if (command) {
				decorations.push({
					range: command.location,
					hoverMessage: `Agent command detected: ${command.type} - ${command.description}`
				});
			}
		}

		editor.setDecorations(this.decorationType, decorations);
	}
}

class NaturalLanguageCodeActionProvider implements vscode.CodeActionProvider {
	constructor(private parser: NaturalLanguageCommandParser) { }

	provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection,
		context: vscode.CodeActionContext,
		token: vscode.CancellationToken
	): vscode.CodeAction[] {
		const line = document.lineAt(range.start.line);
		const command = this.parser.parseComment(line.text, range.start.line);

		if (!command) {
			return [];
		}

		const action = new vscode.CodeAction(
			`Execute: ${command.description}`,
			vscode.CodeActionKind.QuickFix
		);

		action.command = {
			command: 'aiide.executeNaturalLanguageCommand',
			title: 'Execute Command',
			arguments: [command, document]
		};

		return [action];
	}
}
