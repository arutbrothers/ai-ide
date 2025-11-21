import * as vscode from 'vscode';
import { BrowserManager } from '@ai-ide/browser-control';

export class BrowserPanel {
	public static currentPanel: BrowserPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private browserManager: BrowserManager;
	private cdpUrl: string = '';

	public static createOrShow(extensionUri: vscode.Uri, browserManager: BrowserManager) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (BrowserPanel.currentPanel) {
			BrowserPanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'aiideBrowser',
			'AI IDE Browser',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [extensionUri]
			}
		);

		BrowserPanel.currentPanel = new BrowserPanel(panel, extensionUri, browserManager);
	}

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		browserManager: BrowserManager
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.browserManager = browserManager;

		this._update();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'navigate':
						await this.navigate(message.url);
						break;
					case 'click':
						await this.click(message.selector);
						break;
					case 'type':
						await this.type(message.selector, message.text);
						break;
					case 'screenshot':
						await this.takeScreenshot();
						break;
					case 'toggleManualControl':
						this.toggleManualControl(message.enabled);
						break;
				}
			},
			null,
			this._disposables
		);
	}

	private async navigate(url: string) {
		try {
			const page = await this.browserManager.getActivePage();
			if (page) {
				await page.goto(url);
				this._panel.webview.postMessage({
					type: 'navigationComplete',
					url: page.url()
				});
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Navigation failed: ${error}`);
		}
	}

	private async click(selector: string) {
		try {
			const page = await this.browserManager.getActivePage();
			if (page) {
				await page.click(selector);
				this._panel.webview.postMessage({
					type: 'actionComplete',
					action: 'click',
					selector
				});
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Click failed: ${error}`);
		}
	}

	private async type(selector: string, text: string) {
		try {
			const page = await this.browserManager.getActivePage();
			if (page) {
				await page.fill(selector, text);
				this._panel.webview.postMessage({
					type: 'actionComplete',
					action: 'type',
					selector,
					text
				});
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Type failed: ${error}`);
		}
	}

	private async takeScreenshot() {
		try {
			const page = await this.browserManager.getActivePage();
			if (page) {
				const screenshot = await page.screenshot({ type: 'png' });
				this._panel.webview.postMessage({
					type: 'screenshot',
					data: screenshot.toString('base64')
				});
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Screenshot failed: ${error}`);
		}
	}

	private toggleManualControl(enabled: boolean) {
		// Toggle between agent control and manual control
		this._panel.webview.postMessage({
			type: 'manualControlToggled',
			enabled
		});
	}

	public async connectToBrowser() {
		try {
			const context = await this.browserManager.getBrowserContext();
			const pages = context.pages();

			if (pages.length > 0) {
				const page = pages[0];
				// Get CDP endpoint
				const cdpSession = await page.context().newCDPSession(page);

				// Get the WebSocket debugger URL
				this.cdpUrl = `ws://localhost:${this.browserManager['port']}/devtools/page/${page.url()}`;

				this._panel.webview.postMessage({
					type: 'cdpConnected',
					url: this.cdpUrl
				});
			}
		} catch (error) {
			console.error('Failed to connect to browser:', error);
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'browser-panel.js')
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'browser-panel.css')
		);

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${styleUri}" rel="stylesheet">
			<title>AI IDE Browser</title>
		</head>
		<body>
			<div class="browser-container">
				<div class="browser-toolbar">
					<input type="text" id="url-bar" placeholder="Enter URL..." />
					<button id="navigate-btn">Go</button>
					<button id="screenshot-btn">📸 Screenshot</button>
					<label>
						<input type="checkbox" id="manual-control" />
						Manual Control
					</label>
				</div>

				<div class="browser-content">
					<iframe id="browser-frame" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
				</div>

				<div class="action-overlay" id="action-overlay">
					<div class="action-log">
						<h3>Action Log</h3>
						<div id="action-list"></div>
					</div>
				</div>

				<div class="screenshot-gallery" id="screenshot-gallery">
					<h3>Screenshots</h3>
					<div id="screenshot-list"></div>
				</div>
			</div>
			<script src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	public dispose() {
		BrowserPanel.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}
