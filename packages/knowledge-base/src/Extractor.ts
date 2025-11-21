import { KnowledgeItem } from './types';
import { KnowledgeStore } from './KnowledgeStore';

export class Extractor {
	constructor(private store: KnowledgeStore) { }

	async extractFromTask(taskResult: {
		taskId: string;
		description: string;
		codeDiffs?: Array<{ path: string; content: string }>;
		success: boolean;
		language?: string;
		framework?: string;
	}): Promise<KnowledgeItem[]> {
		if (!taskResult.success) {
			return []; // Only extract from successful tasks
		}

		const extracted: Omit<KnowledgeItem, 'id' | 'metadata'>[] = [];

		// Extract code patterns from diffs
		if (taskResult.codeDiffs && taskResult.codeDiffs.length > 0) {
			for (const diff of taskResult.codeDiffs) {
				// Extract functions/classes
				const functions = this.extractFunctions(diff.content);

				for (const func of functions) {
					extracted.push({
						type: 'snippet',
						title: `Function: ${func.name}`,
						content: func.code,
						context: {
							language: taskResult.language || this.detectLanguage(diff.path),
							framework: taskResult.framework
						},
						tags: ['auto-extracted', 'function', func.name]
					});
				}
			}
		}

		// Extract task template
		extracted.push({
			type: 'task_template',
			title: `Task: ${taskResult.description}`,
			content: JSON.stringify({
				description: taskResult.description,
				steps: ['Analyze requirements', 'Implement solution', 'Test', 'Verify'],
				estimatedTime: '15 minutes'
			}),
			context: {
				language: taskResult.language,
				framework: taskResult.framework
			},
			tags: ['task-template', 'auto-extracted']
		});

		// Store extracted items
		for (const item of extracted) {
			await this.store.add(item);
		}

		return extracted as KnowledgeItem[];
	}

	private extractFunctions(code: string): Array<{ name: string; code: string }> {
		const functions: Array<{ name: string; code: string }> = [];

		// Simple regex-based extraction (would use AST in production)
		const functionRegex = /(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:\([^)]*\)|async)?\s*(?:=>)?\s*{([^}]+)}/g;

		let match;
		while ((match = functionRegex.exec(code)) !== null) {
			functions.push({
				name: match[1],
				code: match[0]
			});
		}

		return functions;
	}

	private detectLanguage(filePath: string): string {
		const ext = filePath.split('.').pop()?.toLowerCase();
		const langMap: Record<string, string> = {
			'ts': 'typescript',
			'tsx': 'typescript',
			'js': 'javascript',
			'jsx': 'javascript',
			'py': 'python',
			'go': 'go',
			'rs': 'rust',
			'java': 'java',
			'cpp': 'cpp',
			'c': 'c'
		};
		return langMap[ext || ''] || 'unknown';
	}
}
