import { Agent, Scheduler } from '@ai-ide/agent-runtime';

interface QueueItem {
	agentId: string;
	goal: string;
	priority: number;
	retryCount: number;
}

export class EnhancedScheduler extends Scheduler {
	private queue: QueueItem[] = [];
	private maxRetries: number = 3;
	private retryDelay: number = 5000; // 5 seconds

	async scheduleWithPriority(agentId: string, goal: string, priority: number = 0): Promise<void> {
		const item: QueueItem = { agentId, goal, priority, retryCount: 0 };

		// Insert based on priority (higher priority first)
		const insertIndex = this.queue.findIndex(q => q.priority < priority);
		if (insertIndex === -1) {
			this.queue.push(item);
		} else {
			this.queue.splice(insertIndex, 0, item);
		}

		await this.processQueue();
	}

	private async processQueue(): Promise<void> {
		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (!item) break;

			try {
				await this.schedule(item.agentId, item.goal);
			} catch (error) {
				console.error(`Agent ${item.agentId} failed:`, error);

				// Retry logic
				if (item.retryCount < this.maxRetries) {
					item.retryCount++;
					console.log(`Retrying agent ${item.agentId} (attempt ${item.retryCount}/${this.maxRetries})`);

					await new Promise(resolve => setTimeout(resolve, this.retryDelay * item.retryCount));
					this.queue.unshift(item); // Add back to front of queue
				} else {
					console.error(`Agent ${item.agentId} failed after ${this.maxRetries} retries`);
				}
			}
		}
	}

	async cancelAgent(agentId: string): Promise<void> {
		this.queue = this.queue.filter(item => item.agentId !== agentId);
	}

	getQueueStatus(): Array<{ agentId: string; goal: string; priority: number; position: number }> {
		return this.queue.map((item, index) => ({
			agentId: item.agentId,
			goal: item.goal,
			priority: item.priority,
			position: index + 1
		}));
	}
}
