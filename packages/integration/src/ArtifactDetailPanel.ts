import * as vscode from 'vscode';
import { ArtifactStore } from '@ai-ide/artifact-system';

export class ArtifactDetailPanel {
	public static currentPanel: ArtifactDetailPanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private artifactStore: ArtifactStore;
	private currentArtifactId: string | null = null;

	public static createOrShow(
		extensionUri: vscode.Uri,
		artifactStore: ArtifactStore,
		artifactId: string
	) {
		const column = vscode.ViewColumn.Two;

		if (ArtifactDetailPanel.currentPanel) {
			ArtifactDetailPanel.currentPanel._panel.reveal(column);
			ArtifactDetailPanel.currentPanel.loadArtifact(artifactId);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'aiideArtifactDetail',
			'Artifact Details',
			column,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [extensionUri]
			}
		);

		ArtifactDetailPanel.currentPanel = new ArtifactDetailPanel(
			panel,
			extensionUri,
			artifactStore,
			artifactId
		);
	}

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		artifactStore: ArtifactStore,
		artifactId: string
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.artifactStore = artifactStore;
		this.currentArtifactId = artifactId;

		this._update();
		this.loadArtifact(artifactId);

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'openFile':
						await this.openFile(message.path);
						break;
					case 'copyContent':
						await this.copyContent(message.content);
						break;
					case 'deleteArtifact':
						await this.deleteArtifact(message.id);
						break;
					case 'downloadArtifact':
						await this.downloadArtifact(message.id);
						break;
				}
			},
			null,
			this._disposables
		);
	}

	private async loadArtifact(artifactId: string) {
		this.currentArtifactId = artifactId;

		try {
			const artifact = await this.artifactStore.getArtifact(artifactId);

			if (artifact) {
				this._panel.webview.postMessage({
					type: 'artifactLoaded',
					artifact: {
						id: artifact.id,
						type: artifact.type,
						content: artifact.content,
						metadata: artifact.metadata,
						createdAt: artifact.createdAt,
						agentId: artifact.agentId
					}
				});
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to load artifact: ${error}`);
		}
	}

	private async openFile(filePath: string) {
		try {
			const uri = vscode.Uri.file(filePath);
			await vscode.window.showTextDocument(uri);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to open file: ${error}`);
		}
	}

	private async copyContent(content: string) {
		await vscode.env.clipboard.writeText(content);
		vscode.window.showInformationMessage('Content copied to clipboard');
	}

	private async deleteArtifact(artifactId: string) {
		const confirm = await vscode.window.showWarningMessage(
			'Are you sure you want to delete this artifact?',
			'Delete',
			'Cancel'
		);

		if (confirm === 'Delete') {
			try {
				await this.artifactStore.deleteArtifact(artifactId);
				vscode.window.showInformationMessage('Artifact deleted');
				this._panel.dispose();
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to delete artifact: ${error}`);
			}
		}
	}

	private async downloadArtifact(artifactId: string) {
		try {
			const artifact = await this.artifactStore.getArtifact(artifactId);
			if (!artifact) return;

			const uri = await vscode.window.showSaveDialog({
				defaultUri: vscode.Uri.file(`${artifact.type}_${artifactId}.txt`),
				filters: {
					'Text Files': ['txt'],
					'JSON Files': ['json'],
					'All Files': ['*']
				}
			});

			if (uri) {
				await vscode.workspace.fs.writeFile(
					uri,
					Buffer.from(artifact.content, 'utf-8')
				);
				vscode.window.showInformationMessage('Artifact downloaded');
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to download artifact: ${error}`);
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'artifact-detail.js')
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'artifact-detail.css')
		);

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${styleUri}" rel="stylesheet">
			<title>Artifact Details</title>
		</head>
		<body>
			<div class="artifact-container">
				<div class="artifact-header">
					<h1 id="artifact-title">Loading...</h1>
					<div class="artifact-actions">
						<button id="copy-btn">📋 Copy</button>
						<button id="download-btn">💾 Download</button>
						<button id="delete-btn" class="danger">🗑️ Delete</button>
					</div>
				</div>

				<div class="artifact-metadata">
					<div class="metadata-item">
						<label>Type:</label>
						<span id="artifact-type"></span>
					</div>
					<div class="metadata-item">
						<label>Created:</label>
						<span id="artifact-created"></span>
					</div>
					<div class="metadata-item">
						<label>Agent:</label>
						<span id="artifact-agent"></span>
					</div>
					<div class="metadata-item">
						<label>ID:</label>
						<span id="artifact-id"></span>
					</div>
				</div>

				<div class="artifact-content">
					<pre id="content-display"></pre>
				</div>

				<div class="artifact-files" id="related-files"></div>
			</div>
			<script src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	public dispose() {
		ArtifactDetailPanel.currentPanel = undefined;
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}
