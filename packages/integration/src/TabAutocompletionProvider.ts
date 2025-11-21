import * as vscode from 'vscode';
import { ModelProvider } from '@ai-ide/model-provider';

export class TabAutocompletionProvider implements vscode.InlineCompletionItemProvider {
	constructor(private modelProvider: ModelProvider) { }

	async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken
	): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined> {

		// Get document context
		const textBeforeCursor = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
		const textAfterCursor = document.getText(new vscode.Range(position, document.lineAt(document.lineCount - 1).range.end));

		// Build FIM (Fill-In-the-Middle) prompt
		const prompt = `<|fim_prefix|>${textBeforeCursor}<|fim_suffix|>${textAfterCursor}<|fim_middle|>`;

		try {
			const response = await this.modelProvider.generate(prompt, {
				maxTokens: 200,
				temperature: 0.2,
				stop: ['\n\n', '<|file_separator|>', '<|fim_suffix|>']
			});

			const completion = response.content.trim();

			if (!completion) {
				return undefined;
			}

			// Support multi-line completions
			const lines = completion.split('\n');
			const insertText = lines.join('\n');

			return [
				new vscode.InlineCompletionItem(
					insertText,
					new vscode.Range(position, position)
				)
			];
		} catch (error) {
			console.error('Tab autocompletion error:', error);
			return undefined;
		}
	}
}

export class MultiLineCompletionProvider implements vscode.InlineCompletionItemProvider {
	constructor(private modelProvider: ModelProvider) { }

	async provideInlineCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position,
		context: vscode.InlineCompletionContext,
		token: vscode.CancellationToken
	): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | undefined> {

		// Get broader context for multi-line suggestions
		const currentLine = document.lineAt(position.line).text;
		const previousLines = [];

		// Get up to 50 lines of context
		for (let i = Math.max(0, position.line - 50); i < position.line; i++) {
			previousLines.push(document.lineAt(i).text);
		}

		const context_text = previousLines.join('\n');
		const prefix = currentLine.substring(0, position.character);

		const prompt = `Given this code context:\n\n${context_text}\n\nContinue this line:\n${prefix}`;

		try {
			const response = await this.modelProvider.generate(prompt, {
				maxTokens: 300,
				temperature: 0.3,
				systemPrompt: 'You are a code completion assistant. Provide only the completion, no explanations.'
			});

			const completion = response.content.trim();

			if (!completion) {
				return undefined;
			}

			return [
				new vscode.InlineCompletionItem(
					completion,
					new vscode.Range(position, position)
				)
			];
		} catch (error) {
			console.error('Multi-line completion error:', error);
			return undefined;
		}
	}
}
