import * as vscode from 'vscode';

interface AgentComment {
	id: string;
	agentId: string;
	range: vscode.Range;
	message: string;
	timestamp: Date;
	type: 'info' | 'change' | 'warning';
}

export class AgentCommentProvider {
	private comments: Map<string, AgentComment[]> = new Map();
	private decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();

	constructor() {
		this.initializeDecorations();
	}

	private initializeDecorations() {
		// Info comments (blue)
		this.decorationTypes.set('info', vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('editorInfo.background'),
			borderLeft: '3px solid',
			borderColor: new vscode.ThemeColor('editorInfo.foreground'),
			isWholeLine: true,
			after: {
				contentText: ' 🤖',
				color: new vscode.ThemeColor('editorInfo.foreground')
			}
		}));

		// Change comments (green)
		this.decorationTypes.set('change', vscode.window.createTextEditorDecorationType({
			backgroundColor: 'rgba(0, 255, 0, 0.1)',
			borderLeft: '3px solid green',
			isWholeLine: true,
			after: {
				contentText: ' ✓ Agent modified',
				color: 'green',
				fontStyle: 'italic'
			}
		}));

		// Warning comments (yellow)
		this.decorationTypes.set('warning', vscode.window.createTextEditorDecorationType({
			backgroundColor: new vscode.ThemeColor('editorWarning.background'),
			borderLeft: '3px solid',
			borderColor: new vscode.ThemeColor('editorWarning.foreground'),
			isWholeLine: true,
			after: {
				contentText: ' ⚠️ Review needed',
				color: new vscode.ThemeColor('editorWarning.foreground')
			}
		}));
	}

	addComment(
		documentUri: string,
		agentId: string,
		range: vscode.Range,
		message: string,
		type: 'info' | 'change' | 'warning' = 'info'
	): string {
		const commentId = `${agentId}-${Date.now()}`;
		const comment: AgentComment = {
			id: commentId,
			agentId,
			range,
			message,
			timestamp: new Date(),
			type
		};

		if (!this.comments.has(documentUri)) {
			this.comments.set(documentUri, []);
		}

		this.comments.get(documentUri)!.push(comment);
		return commentId;
	}

	getComments(documentUri: string): AgentComment[] {
		return this.comments.get(documentUri) || [];
	}

	removeComment(documentUri: string, commentId: string) {
		const comments = this.comments.get(documentUri);
		if (comments) {
			const index = comments.findIndex(c => c.id === commentId);
			if (index !== -1) {
				comments.splice(index, 1);
			}
		}
	}

	updateDecorations(editor: vscode.TextEditor) {
		const documentUri = editor.document.uri.toString();
		const comments = this.getComments(documentUri);

		// Group comments by type
		const commentsByType = new Map<string, vscode.DecorationOptions[]>();
		commentsByType.set('info', []);
		commentsByType.set('change', []);
		commentsByType.set('warning', []);

		for (const comment of comments) {
			const decoration: vscode.DecorationOptions = {
				range: comment.range,
				hoverMessage: new vscode.MarkdownString(
					`**Agent ${comment.agentId}** (${comment.timestamp.toLocaleTimeString()})\n\n${comment.message}`
				)
			};

			commentsByType.get(comment.type)!.push(decoration);
		}

		// Apply decorations
		for (const [type, decorations] of commentsByType) {
			const decorationType = this.decorationTypes.get(type);
			if (decorationType) {
				editor.setDecorations(decorationType, decorations);
			}
		}
	}

	activate(context: vscode.ExtensionContext) {
		// Update decorations when active editor changes
		vscode.window.onDidChangeActiveTextEditor(editor => {
			if (editor) {
				this.updateDecorations(editor);
			}
		});

		// Update decorations when document changes
		vscode.workspace.onDidChangeTextDocument(event => {
			const editor = vscode.window.activeTextEditor;
			if (editor && event.document === editor.document) {
				this.updateDecorations(editor);
			}
		});

		// Register hover provider for detailed comment view
		context.subscriptions.push(
			vscode.languages.registerHoverProvider(
				{ scheme: 'file' },
				new AgentCommentHoverProvider(this)
			)
		);
	}
}

class AgentCommentHoverProvider implements vscode.HoverProvider {
	constructor(private commentProvider: AgentCommentProvider) { }

	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): vscode.Hover | undefined {
		const documentUri = document.uri.toString();
		const comments = this.commentProvider.getComments(documentUri);

		for (const comment of comments) {
			if (comment.range.contains(position)) {
				const markdown = new vscode.MarkdownString();
				markdown.appendMarkdown(`### 🤖 Agent Comment\n\n`);
				markdown.appendMarkdown(`**Agent:** ${comment.agentId}\n\n`);
				markdown.appendMarkdown(`**Time:** ${comment.timestamp.toLocaleString()}\n\n`);
				markdown.appendMarkdown(`**Message:**\n\n${comment.message}\n\n`);
				markdown.appendMarkdown(`---\n\n`);
				markdown.appendMarkdown(`[Remove Comment](command:aiide.removeAgentComment?${encodeURIComponent(JSON.stringify({ documentUri, commentId: comment.id }))})`);
				markdown.isTrusted = true;

				return new vscode.Hover(markdown, comment.range);
			}
		}

		return undefined;
	}
}
