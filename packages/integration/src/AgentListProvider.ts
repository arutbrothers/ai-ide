import * as vscode from 'vscode';

export interface AgentListItem {
	id: string;
	name: string;
	status: string;
	priority: number;
	progress: number;
	tasks: any[];
}

export class AgentListProvider implements vscode.TreeDataProvider<AgentListItem> {
	private _onDidChangeTreeData = new vscode.EventEmitter<AgentListItem | undefined | null | void>();
	readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

	private agents: AgentListItem[] = [];
	private filterStatus: string | null = null;

	constructor() { }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	updateAgents(agents: AgentListItem[]): void {
		this.agents = agents.sort((a, b) => b.priority - a.priority);
		this.refresh();
	}

	setFilter(status: string | null): void {
		this.filterStatus = status;
		this.refresh();
	}

	getTreeItem(element: AgentListItem): vscode.TreeItem {
		const treeItem = new vscode.TreeItem(
			element.name,
			vscode.TreeItemCollapsibleState.Collapsed
		);

		treeItem.description = `${element.status} (${element.progress}%)`;
		treeItem.contextValue = 'agent';
		treeItem.iconPath = new vscode.ThemeIcon(this.getIconForStatus(element.status));
		treeItem.command = {
			command: 'aiide.viewAgentDetails',
			title: 'View Agent Details',
			arguments: [element.id]
		};

		return treeItem;
	}

	getChildren(element?: AgentListItem): Thenable<AgentListItem[]> {
		if (!element) {
			// Return root level agents
			let filtered = this.agents;
			if (this.filterStatus) {
				filtered = this.agents.filter(a => a.status === this.filterStatus);
			}
			return Promise.resolve(filtered);
		}

		// Return tasks as children (not implemented in this simple version)
		return Promise.resolve([]);
	}

	private getIconForStatus(status: string): string {
		const iconMap: { [key: string]: string } = {
			'planning': 'lightbulb',
			'awaiting_approval': 'clock',
			'executing': 'play',
			'verifying': 'check',
			'completed': 'check-all',
			'failed': 'error',
			'paused': 'debug-pause'
		};
		return iconMap[status] || 'circle-outline';
	}

	// Drag and drop support
	async movePriority(agentId: string, newPriority: number): Promise<void> {
		const agent = this.agents.find(a => a.id === agentId);
		if (agent) {
			agent.priority = newPriority;
			this.agents.sort((a, b) => b.priority - a.priority);
			this.refresh();
		}
	}

	increasePriority(agentId: string): void {
		const agent = this.agents.find(a => a.id === agentId);
		if (agent) {
			agent.priority += 10;
			this.agents.sort((a, b) => b.priority - a.priority);
			this.refresh();
		}
	}

	decreasePriority(agentId: string): void {
		const agent = this.agents.find(a => a.id === agentId);
		if (agent) {
			agent.priority = Math.max(0, agent.priority - 10);
			this.agents.sort((a, b) => b.priority - a.priority);
			this.refresh();
		}
	}
}

export class AgentFilterProvider {
	private statusBar: vscode.StatusBarItem;
	private currentFilter: string | null = null;

	constructor(private listProvider: AgentListProvider) {
		this.statusBar = vscode.window.createStatusBarItem(
			vscode.StatusBarAlignment.Left,
			100
		);
		this.statusBar.command = 'aiide.filterAgents';
		this.updateStatusBar();
		this.statusBar.show();
	}

	async showFilterMenu(): Promise<void> {
		const options = [
			{ label: '$(circle-outline) All Agents', value: null },
			{ label: '$(lightbulb) Planning', value: 'planning' },
			{ label: '$(clock) Awaiting Approval', value: 'awaiting_approval' },
			{ label: '$(play) Executing', value: 'executing' },
			{ label: '$(check) Verifying', value: 'verifying' },
			{ label: '$(check-all) Completed', value: 'completed' },
			{ label: '$(error) Failed', value: 'failed' },
			{ label: '$(debug-pause) Paused', value: 'paused' }
		];

		const selected = await vscode.window.showQuickPick(options, {
			placeHolder: 'Filter agents by status'
		});

		if (selected) {
			this.currentFilter = selected.value;
			this.listProvider.setFilter(this.currentFilter);
			this.updateStatusBar();
		}
	}

	private updateStatusBar(): void {
		if (this.currentFilter) {
			this.statusBar.text = `$(filter) ${this.currentFilter}`;
		} else {
			this.statusBar.text = '$(filter) All Agents';
		}
	}

	dispose(): void {
		this.statusBar.dispose();
	}
}
