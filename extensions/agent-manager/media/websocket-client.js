// WebSocket client for real-time agent updates
export class WebSocketClient {
	private ws: WebSocket | null = null;
	private url: string;
	private reconnectAttempts: number = 0;
	private maxReconnectAttempts: number = 5;
	private reconnectDelay: number = 2000;
	private listeners: Map<string, Set<Function>> = new Map();

	constructor(url: string = 'ws://localhost:8080') {
		this.url = url;
	}

	connect(): void {
		try {
			this.ws = new WebSocket(this.url);

			this.ws.onopen = () => {
				console.log('WebSocket connected');
				this.reconnectAttempts = 0;
				this.emit('connected', {});
			};

			this.ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					this.emit(data.type, data);
				} catch (error) {
					console.error('Failed to parse WebSocket message:', error);
				}
			};

			this.ws.onerror = (error) => {
				console.error('WebSocket error:', error);
				this.emit('error', error);
			};

			this.ws.onclose = () => {
				console.log('WebSocket disconnected');
				this.emit('disconnected', {});
				this.attemptReconnect();
			};
		} catch (error) {
			console.error('Failed to connect WebSocket:', error);
			this.attemptReconnect();
		}
	}

	private attemptReconnect(): void {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

			setTimeout(() => {
				this.connect();
			}, this.reconnectDelay * this.reconnectAttempts);
		} else {
			console.error('Max reconnect attempts reached');
			this.emit('maxReconnectReached', {});
		}
	}

	on(event: string, callback: Function): void {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(callback);
	}

	off(event: string, callback: Function): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.delete(callback);
		}
	}

	private emit(event: string, data: any): void {
		const callbacks = this.listeners.get(event);
		if (callbacks) {
			callbacks.forEach(callback => callback(data));
		}
	}

	send(data: any): void {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify(data));
		} else {
			console.warn('WebSocket not connected');
		}
	}

	disconnect(): void {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}

	isConnected(): boolean {
		return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
	}
}

// Update agent list UI with WebSocket data
export function initializeAgentListUpdates(containerId: string = 'agent-list') {
	const client = new WebSocketClient();

	client.on('connected', () => {
		console.log('Connected to agent updates');
	});

	client.on('updateAgents', (data: any) => {
		updateAgentList(data.agents, containerId);
	});

	client.on('stateChange', (data: any) => {
		updateAgentStatus(data.agentId, data.data.status, containerId);
	});

	client.on('taskStarted', (data: any) => {
		addTaskToAgent(data.agentId, data.data, containerId);
	});

	client.on('taskCompleted', (data: any) => {
		markTaskCompleted(data.agentId, data.data.taskId, containerId);
	});

	client.on('progress', (data: any) => {
		updateAgentProgress(data.agentId, data.data.progress, containerId);
	});

	client.connect();
	return client;
}

function updateAgentList(agents: any[], containerId: string) {
	const container = document.getElementById(containerId);
	if (!container) return;

	container.innerHTML = agents.map(agent => `
		<div class="agent-card" data-agent-id="${agent.id}">
			<div class="agent-header">
				<h3>${agent.name}</h3>
				<span class="status-badge status-${agent.status}">${agent.status}</span>
			</div>
			<div class="agent-progress">
				<div class="progress-bar" style="width: ${agent.progress}%"></div>
			</div>
			<div class="agent-tasks">
				${agent.tasks.map((t: any) => `
					<div class="task-item ${t.status}">
						${t.status === 'completed' ? '✓' : '⏳'} ${t.description}
					</div>
				`).join('')}
			</div>
			<div class="agent-actions">
				<button onclick="pauseAgent('${agent.id}')">Pause</button>
				<button onclick="viewDetails('${agent.id}')">Details</button>
			</div>
		</div>
	`).join('');
}

function updateAgentStatus(agentId: string, status: string, containerId: string) {
	const card = document.querySelector(`[data-agent-id="${agentId}"]`);
	if (card) {
		const badge = card.querySelector('.status-badge');
		if (badge) {
			badge.className = `status-badge status-${status}`;
			badge.textContent = status;
		}
	}
}

function updateAgentProgress(agentId: string, progress: number, containerId: string) {
	const card = document.querySelector(`[data-agent-id="${agentId}"]`);
	if (card) {
		const progressBar = card.querySelector('.progress-bar') as HTMLElement;
		if (progressBar) {
			progressBar.style.width = `${progress}%`;
		}
	}
}

function addTaskToAgent(agentId: string, task: any, containerId: string) {
	const card = document.querySelector(`[data-agent-id="${agentId}"]`);
	if (card) {
		const tasksContainer = card.querySelector('.agent-tasks');
		if (tasksContainer) {
			const taskElement = document.createElement('div');
			taskElement.className = `task-item ${task.status}`;
			taskElement.innerHTML = `⏳ ${task.description}`;
			tasksContainer.appendChild(taskElement);
		}
	}
}

function markTaskCompleted(agentId: string, taskId: string, containerId: string) {
	const card = document.querySelector(`[data-agent-id="${agentId}"]`);
	if (card) {
		const tasks = card.querySelectorAll('.task-item');
		tasks.forEach(task => {
			if (task.textContent?.includes(taskId)) {
				task.className = 'task-item completed';
				task.innerHTML = task.innerHTML.replace('⏳', '✓');
			}
		});
	}
}
