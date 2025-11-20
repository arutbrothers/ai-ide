import * as vscode from 'vscode';
import { Retriever } from './Retriever';
import { KnowledgeStore } from './KnowledgeStore';

class KnowledgeBaseViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'knowledge-base-view';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Knowledge Base</title>
			</head>
			<body>
				<h1>Knowledge Base</h1>
				<p>Browse and manage your knowledge base.</p>
			</body>
			</html>`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function activate(context: vscode.ExtensionContext) {
	const provider = new KnowledgeBaseViewProvider(context.extensionUri);
	const knowledgeStore = new KnowledgeStore(context.globalStorageUri.fsPath);
	const retriever = new Retriever();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(KnowledgeBaseViewProvider.viewType, provider));

	context.subscriptions.push(vscode.commands.registerCommand('knowledge-base.search', async (query: string) => {
		return await retriever.retrieve(query);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('knowledge-base.add', async (item: any) => {
		// In a real implementation, this would be more robust.
		await knowledgeStore.add(item);
	}));
}

export function deactivate() {}
