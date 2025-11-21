import * as vscode from 'vscode';
import { KnowledgeStore } from '@ai-ide/knowledge-base';

export class KnowledgeBasePanel {
	public static currentPanel: KnowledgeBasePanel | undefined;
	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionUri: vscode.Uri;
	private _disposables: vscode.Disposable[] = [];
	private knowledgeStore: KnowledgeStore;

	public static createOrShow(extensionUri: vscode.Uri, knowledgeStore: KnowledgeStore) {
		const column = vscode.ViewColumn.Two;

		if (KnowledgeBasePanel.currentPanel) {
			KnowledgeBasePanel.currentPanel._panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'aiideKnowledgeBase',
			'Knowledge Base',
			column,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [extensionUri]
			}
		);

		KnowledgeBasePanel.currentPanel = new KnowledgeBasePanel(panel, extensionUri, knowledgeStore);
	}

	private constructor(
		panel: vscode.WebviewPanel,
		extensionUri: vscode.Uri,
		knowledgeStore: KnowledgeStore
	) {
		this._panel = panel;
		this._extensionUri = extensionUri;
		this.knowledgeStore = knowledgeStore;

		this._update();

		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		this._panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.command) {
					case 'search':
						await this.search(message.query);
						break;
					case 'add':
						await this.addKnowledge(message.data);
						break;
					case 'edit':
						await this.editKnowledge(message.id, message.data);
						break;
					case 'delete':
						await this.deleteKnowledge(message.id);
						break;
					case 'loadAll':
						await this.loadAll();
						break;
					case 'getStats':
						await this.getStats();
						break;
				}
			},
			null,
			this._disposables
		);

		// Initial load
		this.loadAll();
	}

	private async search(query: string) {
		try {
			const results = await this.knowledgeStore.search(query, 20);
			this._panel.webview.postMessage({
				type: 'searchResults',
				results: results.map(r => ({
					id: r.id,
					content: r.content,
					type: r.type,
					metadata: r.metadata,
					score: r.score
				}))
			});
		} catch (error) {
			vscode.window.showErrorMessage(`Search failed: ${error}`);
		}
	}

	private async addKnowledge(data: any) {
		try {
			await this.knowledgeStore.addKnowledge({
				content: data.content,
				type: data.type,
				metadata: data.metadata || {}
			});

			vscode.window.showInformationMessage('Knowledge added successfully');
			await this.loadAll();
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to add knowledge: ${error}`);
		}
	}

	private async editKnowledge(id: string, data: any) {
		try {
			// Remove old and add new (since we don't have update in base implementation)
			await this.knowledgeStore.removeKnowledge(id);
			await this.knowledgeStore.addKnowledge({
				content: data.content,
				type: data.type,
				metadata: data.metadata || {}
			});

			vscode.window.showInformationMessage('Knowledge updated successfully');
			await this.loadAll();
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to update knowledge: ${error}`);
		}
	}

	private async deleteKnowledge(id: string) {
		try {
			await this.knowledgeStore.removeKnowledge(id);
			vscode.window.showInformationMessage('Knowledge deleted successfully');
			await this.loadAll();
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to delete knowledge: ${error}`);
		}
	}

	private async loadAll() {
		try {
			// Get all knowledge items (search with empty query)
			const results = await this.knowledgeStore.search('', 100);

			this._panel.webview.postMessage({
				type: 'allKnowledge',
				items: results.map(r => ({
					id: r.id,
					content: r.content,
					type: r.type,
					metadata: r.metadata,
					timestamp: r.metadata?.timestamp || new Date().toISOString()
				}))
			});
		} catch (error) {
			console.error('Failed to load knowledge:', error);
		}
	}

	private async getStats() {
		try {
			const results = await this.knowledgeStore.search('', 1000);

			const stats = {
				total: results.length,
				byType: results.reduce((acc: any, item) => {
					acc[item.type] = (acc[item.type] || 0) + 1;
					return acc;
				}, {}),
				recentlyAdded: results
					.filter(r => r.metadata?.timestamp)
					.sort((a, b) =>
						new Date(b.metadata.timestamp).getTime() -
						new Date(a.metadata.timestamp).getTime()
					)
					.slice(0, 10)
			};

			this._panel.webview.postMessage({
				type: 'stats',
				stats
			});
		} catch (error) {
			console.error('Failed to get stats:', error);
		}
	}

	private _update() {
		const webview = this._panel.webview;
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'knowledge-base.js')
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'media', 'knowledge-base.css')
		);

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${styleUri}" rel="stylesheet">
			<title>Knowledge Base</title>
		</head>
		<body>
			<div class="kb-container">
				<div class="kb-header">
					<h1>Knowledge Base</h1>
					<div class="kb-stats" id="stats"></div>
				</div>

				<div class="kb-toolbar">
					<input type="text" id="search-input" placeholder="Search knowledge..." />
					<button id="search-btn">🔍 Search</button>
					<button id="add-btn">➕ Add New</button>
				</div>

				<div class="kb-content">
					<div class="kb-list" id="knowledge-list"></div>
				</div>
			</div>

			<!-- Add/Edit Modal -->
			<div class="modal" id="edit-modal">
				<div class="modal-content">
					<h2 id="modal-title">Add Knowledge</h2>
					<form id="knowledge-form">
						<div class="form-group">
							<label>Type:</label>
							<select id="type-select">
								<option value="function">Function</option>
								<option value="pattern">Pattern</option>
								<option value="concept">Concept</option>
								<option value="task">Task</option>
								<option value="other">Other</option>
							</select>
						</div>
						<div class="form-group">
							<label>Content:</label>
							<textarea id="content-input" rows="10" required></textarea>
						</div>
						<div class="form-group">
							<label>Tags (comma-separated):</label>
							<input type="text" id="tags-input" />
						</div>
						<div class="form-actions">
							<button type="submit">Save</button>
							<button type="button" id="cancel-btn">Cancel</button>
						</div>
					</form>
				</div>
			</div>

			<script src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	public dispose() {
		KnowledgeBasePanel.currentPanel = undefined;

		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
}
