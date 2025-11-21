import * as vscode from 'vscode';
import {
	AgentService,
	TabAutocompletionProvider,
	MultiLineCompletionProvider,
	NaturalLanguageCommandProvider,
	SupercompleteProvider,
	TabToJumpProvider,
	AgentCommentProvider,
	RealtimeUpdateServer,
	AgentUpdateBroadcaster
} from '@ai-ide/integration';

let agentService: AgentService;
let wsServer: RealtimeUpdateServer;
let broadcaster: AgentUpdateBroadcaster;

export function activate(context: vscode.ExtensionContext) {
	console.log('AI IDE Extension is now active!');

	// Initialize services
	agentService = new AgentService();
	wsServer = new RealtimeUpdateServer(8080);
	wsServer.start();
	broadcaster = new AgentUpdateBroadcaster(wsServer);

	// Connect agent events to broadcaster
	agentService.on('stateChange', (data: any) => broadcaster.onAgentStateChange(data.agentId, data.status, data));
	agentService.on('taskStarted', (data: any) => broadcaster.onTaskStarted(data.agentId, data.taskId, data.description));
	agentService.on('taskCompleted', (data: any) => broadcaster.onTaskCompleted(data.agentId, data.taskId));
	agentService.on('planCreated', (data: any) => broadcaster.onPlanCreated(data.agentId, data.tasks));

	// Get model provider
	const modelRegistry = agentService.getModelRegistry();
	const modelProvider = modelRegistry.getDefault();

	// Register Tab Autocompletion
	const tabCompletion = new TabAutocompletionProvider(modelProvider);
	context.subscriptions.push(
		vscode.languages.registerInlineCompletionItemProvider(
			{ scheme: 'file' },
			tabCompletion
		)
	);

	// Register Multi-line Completion
	const multiLineCompletion = new MultiLineCompletionProvider(modelProvider);
	context.subscriptions.push(
		vscode.languages.registerInlineCompletionItemProvider(
			{ scheme: 'file', pattern: '**/*.{ts,js,tsx,jsx,py,go}' },
			multiLineCompletion
		)
	);

	// Register Natural Language Commands
	const nlCommands = new NaturalLanguageCommandProvider(agentService);
	nlCommands.activate(context);

	// Register Supercomplete
	const supercomplete = new SupercompleteProvider(modelProvider, agentService);
	const tabToJump = new TabToJumpProvider();

	// Register Agent Comments
	const agentComments = new AgentCommentProvider();
	agentComments.activate(context);

	// Register Agent Manager View
	const provider = new AgentManagerViewProvider(context.extensionUri, agentService);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(AgentManagerViewProvider.viewType, provider)
	);

	// Register Commands
	context.subscriptions.push(
		vscode.commands.registerCommand('aiide.createAgent', async () => {
			const goal = await vscode.window.showInputBox({
				prompt: 'What would you like the agent to do?',
				placeHolder: 'e.g., Add user authentication to the app'
			});

			if (goal) {
				const agentId = await agentService.createAgent(goal, {
					name: goal.substring(0, 30),
					workspacePath: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
				});

				vscode.window.showInformationMessage(`Agent ${agentId} created!`);
				provider.refresh();
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('aiide.viewArtifacts', () => {
			vscode.window.showInformationMessage('Artifact viewer coming soon!');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('aiide.toggleAgentManager', () => {
			vscode.commands.executeCommand('workbench.view.extension.agent-manager-container');
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('aiide.executeNaturalLanguageCommand', async (command: any, document: any) => {
			const parser = (nlCommands as any)['parser'];
			await parser.executeCommand(command, document);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('aiide.acceptSupercomplete', async () => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				await supercomplete.acceptPrediction(editor);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('aiide.tabToJump', () => {
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				tabToJump.jumpToNext(editor);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('aiide.removeAgentComment', (args: string) => {
			const { documentUri, commentId } = JSON.parse(args);
			agentComments.removeComment(documentUri, commentId);
			if (vscode.window.activeTextEditor) {
				agentComments.updateDecorations(vscode.window.activeTextEditor);
			}
		})
	);

	// Trigger supercomplete on document change
	vscode.workspace.onDidChangeTextDocument(async (event) => {
		const editor = vscode.window.activeTextEditor;
		if (editor && event.document === editor.document) {
			const prediction = await supercomplete.predictNextChange(
				editor.document,
				editor.selection.active
			);
			if (prediction) {
				supercomplete.showPrediction(editor, prediction);
			}
		}
	});
}

export function deactivate() {
	if (wsServer) {
		wsServer.stop();
	}
}

class AgentManagerViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'agent-manager-view';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		private readonly _agentService: AgentService
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// Handle messages from webview
		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case 'pauseAgent':
					await this._agentService.pauseAgent(data.agentId);
					break;
				case 'resumeAgent':
					await this._agentService.resumeAgent(data.agentId);
					break;
				case 'approveAgent':
					await this._agentService.approveAgent(data.agentId);
					break;
				case 'rejectAgent':
					await this._agentService.rejectAgent(data.agentId);
					break;
			}
		});

		// Initial load
		this.refresh();
	}

	public async refresh() {
		if (this._view) {
			const agents = await this._agentService.listAgents();
			this._view.webview.postMessage({
				type: 'updateAgents',
				agents: agents.map(a => ({
					id: a.id,
					name: a.config.name,
					status: a.state.status,
					progress: a.getProgress(),
					tasks: a.state.tasks
				}))
			});
		}
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>Agent Manager</title>
			</head>
			<body>
				<div id="agent-list"></div>
				<script src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
