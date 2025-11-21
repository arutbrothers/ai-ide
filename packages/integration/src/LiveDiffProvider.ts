import * as vscode from 'vscode';

interface DiffChange {
	range: vscode.Range;
	oldText: string;
	newText: string;
	description?: string;
}

export class LiveDiffProvider {
	private decorationType: vscode.TextEditorDecorationType;
	private pendingChanges: Map<string, DiffChange[]> = new Map();

	constructor() {
		// Create decoration for diff preview
		this.decorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('diffEditor.insertedTextBackground'),
			border: '1px solid',
			borderColor: new vscode.ThemeColor('diffEditor.insertedLineBackground'),
			isWholeLine: false,
			after: {
				contentText: ' ✓ Accept | ✗ Reject',
				color: new vscode.ThemeColor('editorCodeLens.foreground'),
				margin: '0 0 0 1em',
				fontStyle: 'italic'
			}
		});
	}

	showDiff(editor: vscode.TextEditor, change: DiffChange) {
		const documentUri = editor.document.uri.toString();

		if (!this.pendingChanges.has(documentUri)) {
			this.pendingChanges.set(documentUri, []);
		}

		this.pendingChanges.get(documentUri)!.push(change);
		this.updateDecorations(editor);
	}

	private updateDecorations(editor: vscode.TextEditor) {
		const documentUri = editor.document.uri.toString();
		const changes = this.pendingChanges.get(documentUri) || [];

		const decorations: vscode.DecorationOptions[] = changes.map(change => ({
			range: change.range,
			hoverMessage: this.createDiffHoverMessage(change)
		}));

		editor.setDecorations(this.decorationType, decorations);
	}

	private createDiffHoverMessage(change: DiffChange): vscode.MarkdownString {
		const markdown = new vscode.MarkdownString();
		markdown.appendMarkdown('### Proposed Change\n\n');

		if (change.description) {
			markdown.appendMarkdown(`${change.description}\n\n`);
		}

		markdown.appendMarkdown('**Before:**\n```\n');
		markdown.appendText(change.oldText);
		markdown.appendMarkdown('\n```\n\n**After:**\n```\n');
		markdown.appendText(change.newText);
		markdown.appendMarkdown('\n```\n\n');

		markdown.appendMarkdown('[Accept](command:aiide.acceptDiff) | ');
		markdown.appendMarkdown('[Reject](command:aiide.rejectDiff)');
		markdown.isTrusted = true;

		return markdown;
	}

	async acceptChange(editor: vscode.TextEditor, changeIndex: number = 0) {
		const documentUri = editor.document.uri.toString();
		const changes = this.pendingChanges.get(documentUri);

		if (!changes || changeIndex >= changes.length) {
			return false;
		}

		const change = changes[changeIndex];

		await editor.edit(editBuilder => {
			editBuilder.replace(change.range, change.newText);
		});

		// Remove the change
		changes.splice(changeIndex, 1);
		if (changes.length === 0) {
			this.pendingChanges.delete(documentUri);
		}

		this.updateDecorations(editor);
		return true;
	}

	async rejectChange(editor: vscode.TextEditor, changeIndex: number = 0) {
		const documentUri = editor.document.uri.toString();
		const changes = this.pendingChanges.get(documentUri);

		if (!changes || changeIndex >= changes.length) {
			return false;
		}

		// Remove the change without applying
		changes.splice(changeIndex, 1);
		if (changes.length === 0) {
			this.pendingChanges.delete(documentUri);
		}

		this.updateDecorations(editor);
		return true;
	}

	async acceptAllChanges(editor: vscode.TextEditor) {
		const documentUri = editor.document.uri.toString();
		const changes = this.pendingChanges.get(documentUri);

		if (!changes) {
			return;
		}

		// Apply all changes in reverse order to maintain ranges
		const sortedChanges = [...changes].sort((a, b) =>
			b.range.start.compareTo(a.range.start)
		);

		await editor.edit(editBuilder => {
			for (const change of sortedChanges) {
				editBuilder.replace(change.range, change.newText);
			}
		});

		this.pendingChanges.delete(documentUri);
		this.updateDecorations(editor);
	}

	async rejectAllChanges(editor: vscode.TextEditor) {
		const documentUri = editor.document.uri.toString();
		this.pendingChanges.delete(documentUri);
		this.updateDecorations(editor);
	}

	getPendingChanges(documentUri: string): DiffChange[] {
		return this.pendingChanges.get(documentUri) || [];
	}

	clearAll() {
		this.pendingChanges.clear();
	}
}

export class DiffCodeLensProvider implements vscode.CodeLensProvider {
	constructor(private diffProvider: LiveDiffProvider) { }

	provideCodeLenses(
		document: vscode.TextDocument,
		token: vscode.CancellationToken
	): vscode.CodeLens[] {
		const changes = this.diffProvider.getPendingChanges(document.uri.toString());
		const lenses: vscode.CodeLens[] = [];

		if (changes.length > 0) {
			// Add "Accept All" and "Reject All" at the top
			lenses.push(
				new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
					title: `✓ Accept All (${changes.length})`,
					command: 'aiide.acceptAllDiffs'
				}),
				new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
					title: `✗ Reject All`,
					command: 'aiide.rejectAllDiffs'
				})
			);

			// Add individual accept/reject for each change
			changes.forEach((change, index) => {
				lenses.push(
					new vscode.CodeLens(change.range, {
						title: '✓ Accept',
						command: 'aiide.acceptDiff',
						arguments: [index]
					}),
					new vscode.CodeLens(change.range, {
						title: '✗ Reject',
						command: 'aiide.rejectDiff',
						arguments: [index]
					})
				);
			});
		}

		return lenses;
	}
}
