import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';

interface AgentUpdate {
	type: 'stateChange' | 'taskStarted' | 'taskCompleted' | 'planCreated' | 'progress';
	agentId: string;
	data: any;
	timestamp: Date;
}

export class RealtimeUpdateServer extends EventEmitter {
	private wss: WebSocketServer | null = null;
	private clients: Set<WebSocket> = new Set();
	private port: number;

	constructor(port: number = 8080) {
		super();
		this.port = port;
	}

	start(): void {
		this.wss = new WebSocketServer({ port: this.port });

		this.wss.on('connection', (ws: WebSocket) => {
			console.log('Client connected to realtime updates');
			this.clients.add(ws);

			ws.on('close', () => {
				console.log('Client disconnected');
				this.clients.delete(ws);
			});

			ws.on('error', (error) => {
				console.error('WebSocket error:', error);
				this.clients.delete(ws);
			});

			// Send initial connection confirmation
			ws.send(JSON.stringify({
				type: 'connected',
				message: 'Connected to AI IDE realtime updates',
				timestamp: new Date()
			}));
		});

		console.log(`WebSocket server started on port ${this.port}`);
	}

	broadcastAgentUpdate(update: AgentUpdate): void {
		const message = JSON.stringify(update);

		this.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(message);
			}
		});
	}

	sendToClient(clientId: string, data: any): void {
		// In real implementation, track clients by ID
		this.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(data));
			}
		});
	}

	stop(): void {
		if (this.wss) {
			this.clients.forEach(client => client.close());
			this.wss.close();
			console.log('WebSocket server stopped');
		}
	}

	getClientCount(): number {
		return this.clients.size;
	}
}

export class AgentUpdateBroadcaster {
	constructor(private server: RealtimeUpdateServer) { }

	onAgentStateChange(agentId: string, status: string, data?: any) {
		this.server.broadcastAgentUpdate({
			type: 'stateChange',
			agentId,
			data: { status, ...data },
			timestamp: new Date()
		});
	}

	onTaskStarted(agentId: string, taskId: string, description: string) {
		this.server.broadcastAgentUpdate({
			type: 'taskStarted',
			agentId,
			data: { taskId, description },
			timestamp: new Date()
		});
	}

	onTaskCompleted(agentId: string, taskId: string) {
		this.server.broadcastAgentUpdate({
			type: 'taskCompleted',
			agentId,
			data: { taskId },
			timestamp: new Date()
		});
	}

	onPlanCreated(agentId: string, tasks: any[]) {
		this.server.broadcastAgentUpdate({
			type: 'planCreated',
			agentId,
			data: { tasks },
			timestamp: new Date()
		});
	}

	onProgress(agentId: string, progress: number) {
		this.server.broadcastAgentUpdate({
			type: 'progress',
			agentId,
			data: { progress },
			timestamp: new Date()
		});
	}
}
