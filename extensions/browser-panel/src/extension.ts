import * as vscode from 'vscode';
import { BrowserManager } from './BrowserManager';

class BrowserPanelViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'browser-panel-view';

	private _view?: vscode.WebviewView;
	private _browserManager?: BrowserManager;

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

		this._browserManager = new BrowserManager();
		this._browserManager.launch();
	}

	public navigate(url: string) {
		this._browserManager?.navigate(url);
	}

	public click(selector: string) {
		this._browserManager?.click(selector);
	}

	public type(selector: string, text: string) {
		this._browserManager?.type(selector, text);
	}

	public screenshot(path: string) {
		this._browserManager?.screenshot(path);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Browser</title>
			</head>
			<body>
				<div class="browser-container">
					<div class="toolbar">
						<input type="text" id="url-bar" placeholder="https://example.com">
						<button id="manual-control">Manual Control</button>
					</div>
					<div id="root"></div>
					<div class="action-log">
						<h2>Action Log</h2>
						<ul id="action-list"></ul>
					</div>
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
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
	const provider = new BrowserPanelViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(BrowserPanelViewProvider.viewType, provider));

	context.subscriptions.push(vscode.commands.registerCommand('browser-panel.navigate', (url: string) => {
		provider.navigate(url);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('browser-panel.click', (selector: string) => {
		provider.click(selector);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('browser-panel.type', (selector: string, text: string) => {
		provider.type(selector, text);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('browser-panel.screenshot', (path: string) => {
		provider.screenshot(path);
	}));
}

export function deactivate() {}
