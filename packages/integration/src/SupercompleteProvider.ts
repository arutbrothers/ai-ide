import * as vscode from 'vscode';
import { ModelProvider } from '@ai-ide/model-provider';
import { AgentService } from './AgentService';

interface PredictedEdit {
	range: vscode.Range;
	newText: string;
	confidence: number;
	description: string;
}

export class SupercompleteProvider {
	private decorationType: vscode.TextEditorDecorationType;
	private currentPrediction: PredictedEdit | null = null;

	constructor(
		private modelProvider: ModelProvider,
		private agentService: AgentService
	) {
		// Create decoration for predicted changes
		this.decorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('editor.wordHighlightBackground'),
			border: '1px dashed',
			borderColor: new vscode.ThemeColor('editorInfo.foreground'),
			after: {
				contentText: ' ⚡ Tab to accept',
				color: new vscode.ThemeColor('editorInfo.foreground'),
				fontStyle: 'italic'
			}
		});
	}

	async predictNextChange(
		document: vscode.TextDocument,
		position: vscode.Position
	): Promise<PredictedEdit | null> {
		// Get recent changes from document history
		const recentChanges = this.getRecentChanges(document);
		const currentContext = this.getContext(document, position);

		const prompt = `Given this code and recent changes, predict the next logical edit:

Recent changes:
${recentChanges}

Current code:
${currentContext}

Predict the next edit the developer will make. Respond in JSON format:
{
  "lineNumber": <number>,
  "columnStart": <number>,
  "columnEnd": <number>,
  "newText": "<predicted text>",
  "description": "<brief explanation>"
}`;

		try {
			const response = await this.modelProvider.generate(prompt, {
				maxTokens: 300,
				temperature: 0.4,
				systemPrompt: 'You are a code prediction assistant. Predict logical next edits.'
			});

			const prediction = this.parsePrediction(response.content);

			if (prediction) {
				this.currentPrediction = {
					range: new vscode.Range(
						prediction.lineNumber,
						prediction.columnStart,
						prediction.lineNumber,
						prediction.columnEnd
					),
					newText: prediction.newText,
					confidence: 0.8,
					description: prediction.description
				};

				return this.currentPrediction;
			}
		} catch (error) {
			console.error('Supercomplete prediction error:', error);
		}

		return null;
	}

	showPrediction(editor: vscode.TextEditor, prediction: PredictedEdit) {
		const decorations: vscode.DecorationOptions[] = [{
			range: prediction.range,
			hoverMessage: `Predicted: ${prediction.description}\n\nPress Tab to accept`
		}];

		editor.setDecorations(this.decorationType, decorations);
	}

	async acceptPrediction(editor: vscode.TextEditor): Promise<boolean> {
		if (!this.currentPrediction) {
			return false;
		}

		await editor.edit(editBuilder => {
			editBuilder.replace(this.currentPrediction!.range, this.currentPrediction!.newText);
		});

		this.clearPrediction(editor);
		return true;
	}

	clearPrediction(editor: vscode.TextEditor) {
		editor.setDecorations(this.decorationType, []);
		this.currentPrediction = null;
	}

	private getRecentChanges(document: vscode.TextDocument): string {
		// In real implementation, track document change events
		// For now, return placeholder
		return 'Recent changes: Added error handling, refactored function';
	}

	private getContext(document: vscode.TextDocument, position: vscode.Position): string {
		const startLine = Math.max(0, position.line - 20);
		const endLine = Math.min(document.lineCount - 1, position.line + 20);

		const lines = [];
		for (let i = startLine; i <= endLine; i++) {
			lines.push(document.lineAt(i).text);
		}

		return lines.join('\n');
	}

	private parsePrediction(response: string): any {
		try {
			// Extract JSON from response
			const jsonMatch = response.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
		} catch (error) {
			console.error('Failed to parse prediction:', error);
		}
		return null;
	}
}

export class TabToJumpProvider {
	private editLocations: vscode.Position[] = [];
	private currentIndex: number = 0;

	trackEdit(position: vscode.Position) {
		this.editLocations.push(position);
	}

	jumpToNext(editor: vscode.TextEditor): boolean {
		if (this.editLocations.length === 0) {
			return false;
		}

		this.currentIndex = (this.currentIndex + 1) % this.editLocations.length;
		const nextPosition = this.editLocations[this.currentIndex];

		editor.selection = new vscode.Selection(nextPosition, nextPosition);
		editor.revealRange(new vscode.Range(nextPosition, nextPosition));

		return true;
	}

	reset() {
		this.editLocations = [];
		this.currentIndex = 0;
	}
}
