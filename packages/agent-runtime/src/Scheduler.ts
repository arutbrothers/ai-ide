import { Agent } from './Agent';

interface QueueItem {
	agentId: string;
	goal: string;
}

export class Scheduler {
	private agents: Map<string, Agent> = new Map();
	private queue: QueueItem[] = [];
	private maxConcurrent: number = 2;

	registerAgent(agent: Agent): void {
		this.agents.set(agent.id, agent);
	}

	async schedule(agentId: string, goal: string): Promise<void> {
		const agent = this.agents.get(agentId);
		if (!agent) throw new Error('Agent not found');

		if (this.runningAgentsCount() < this.maxConcurrent) {
			// Fire and forget, but catch errors
			agent.start(goal).catch(err => {
				console.error(`Agent ${agentId} failed:`, err);
			}).finally(() => {
				this.onAgentComplete(agentId);
			});
		} else {
			this.queue.push({ agentId, goal });
		}
	}

	private runningAgentsCount(): number {
		return Array.from(this.agents.values()).filter(a => a.state.status === 'executing' || a.state.status === 'planning').length;
	}

	// Called when an agent finishes
	private async onAgentComplete(agentId: string): Promise<void> {
		const nextItem = this.queue.shift();
		if (nextItem) {
			const agent = this.agents.get(nextItem.agentId);
			if (agent) {
				agent.start(nextItem.goal).catch(err => {
					console.error(`Agent ${nextItem.agentId} failed:`, err);
				}).finally(() => {
					this.onAgentComplete(nextItem.agentId);
				});
			}
		}
	}
}
