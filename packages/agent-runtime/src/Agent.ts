import { AgentConfig, AgentState, Task } from './types';
import { ModelProvider } from '@ai-ide/model-provider';
import { ArtifactStore } from '@ai-ide/artifact-system';
import { Planner } from './Planner';
import { Executor } from './Executor';
import { Verifier } from './Verifier';
import { BrowserManager } from '@ai-ide/browser-control';
import { KnowledgeStore, Extractor } from '@ai-ide/knowledge-base';
import { EventEmitter } from 'events';

export class Agent extends EventEmitter {
	public id: string;
	public config: AgentConfig;
	public state: AgentState;

	private planner: Planner;
	private executor: Executor;
	private verifier: Verifier;
	private knowledgeStore?: KnowledgeStore;
	private extractor?: Extractor;
	private awaitingApproval: boolean = false;
	private checkpointState: any = null;

	constructor(
		config: AgentConfig,
		modelProvider: ModelProvider,
		artifactStore: ArtifactStore,
		browserManager: BrowserManager,
		knowledgeStore?: KnowledgeStore
	) {
		super();
		this.id = config.id;
		this.config = config;
		this.knowledgeStore = knowledgeStore;

		this.state = {
			status: 'idle',
			tasks: [],
			artifacts: [],
		};

		this.planner = new Planner(modelProvider);
		this.executor = new Executor(modelProvider, artifactStore, config.workspacePath);
		this.verifier = new Verifier(browserManager, artifactStore);

		if (knowledgeStore) {
			this.extractor = new Extractor(knowledgeStore);
		}
	}

	async start(goal: string): Promise<void> {
		try {
			this.emit('stateChange', { status: 'planning' });

			// 1. PLANNING PHASE
			this.state.status = 'planning';
			console.log(`Agent ${this.id} starting with goal: ${goal}`);

			// Create checkpoint
			this.createCheckpoint();

			// Search knowledge base for relevant patterns
			let context = `Goal: ${goal}\n\n`;
			if (this.knowledgeStore) {
				const relevantKnowledge = await this.knowledgeStore.search(goal);
				if (relevantKnowledge.length > 0) {
					context += 'Relevant patterns from knowledge base:\n';
					context += relevantKnowledge.map(k => `- ${k.title}: ${k.content.substring(0, 100)}`).join('\n');
					context += '\n\n';
				}
			}

			const tasks = await this.planner.createPlan(goal, context);
			this.state.tasks = tasks;

			// Create implementation plan artifact
			this.emit('planCreated', { tasks });

			// 2. AWAIT APPROVAL
			this.state.status = 'idle';
			this.awaitingApproval = true;
			this.emit('awaitingApproval', { tasks });

			console.log('Plan created. Awaiting human approval...');

			// Wait for approval (in real implementation, this would be event-driven)
			await this.waitForApproval();

			if (!this.awaitingApproval) {
				this.emit('rejected');
				return;
			}

			this.awaitingApproval = false;

			// 3. EXECUTION PHASE
			this.state.status = 'executing';
			this.emit('stateChange', { status: 'executing' });

			for (let i = 0; i < this.state.tasks.length; i++) {
				const task = this.state.tasks[i];

				// Check for pause
				while (this.state.status === 'paused') {
					await new Promise(resolve => setTimeout(resolve, 100));
				}

				this.state.currentTaskId = task.id;
				this.emit('taskStarted', { taskId: task.id, description: task.description });

				// Execute task with retry
				let retries = 0;
				const maxRetries = 3;

				while (retries < maxRetries) {
					try {
						await this.executor.executeTask(task, context, this.id);
						break;
					} catch (error) {
						retries++;
						if (retries >= maxRetries) {
							throw error;
						}
						console.log(`Task ${task.id} failed, retrying (${retries}/${maxRetries})...`);
						await new Promise(resolve => setTimeout(resolve, 2000 * retries));
					}
				}

				// Update context with task result
				context += `\nCompleted: ${task.description}`;
				this.emit('taskCompleted', { taskId: task.id });
			}

			// 4. VERIFICATION PHASE
			console.log('Executing verification phase...');
			this.emit('stateChange', { status: 'verifying' });

			for (const task of this.state.tasks) {
				const verified = await this.verifier.verifyTask(task, this.id);
				if (!verified) {
					task.status = 'failed';
					this.state.status = 'failed';
					this.emit('verificationFailed', { taskId: task.id });
					throw new Error(`Task ${task.id} failed verification`);
				}
			}

			// 5. KNOWLEDGE EXTRACTION
			if (this.extractor) {
				console.log('Extracting knowledge from successful execution...');
				for (const task of this.state.tasks) {
					if (task.status === 'completed') {
						await this.extractor.extractFromTask({
							taskId: task.id,
							description: task.description,
							success: true,
							language: 'typescript' // Would be detected from context
						});
					}
				}
			}

			// 6. COMPLETION
			this.state.status = 'completed';
			this.emit('completed', { agentId: this.id });
			console.log(`Agent ${this.id} completed successfully`);

		} catch (error) {
			this.state.status = 'failed';
			this.emit('failed', { agentId: this.id, error: String(error) });
			console.error(`Agent ${this.id} failed:`, error);
			throw error;
		}
	}

	private async waitForApproval(): Promise<void> {
		// In real implementation, this would wait for an event
		// For now, auto-approve after 1 second (demo mode)
		return new Promise(resolve => setTimeout(resolve, 1000));
	}

	async approve(): Promise<void> {
		if (this.awaitingApproval) {
			this.awaitingApproval = false;
			this.emit('approved');
		}
	}

	async reject(): Promise<void> {
		if (this.awaitingApproval) {
			this.awaitingApproval = false;
			this.state.status = 'failed';
			this.emit('rejected');
		}
	}

	async pause(): Promise<void> {
		if (this.state.status === 'executing' || this.state.status === 'planning') {
			this.state.status = 'paused';
			this.createCheckpoint();
			this.emit('paused');
		}
	}

	async resume(): Promise<void> {
		if (this.state.status === 'paused') {
			this.state.status = 'executing';
			this.emit('resumed');
		}
	}

	async stop(): Promise<void> {
		this.state.status = 'completed';
		this.emit('stopped');
	}

	async updateTasks(newTasks: Task[]): Promise<void> {
		this.state.tasks = newTasks;
		this.emit('tasksUpdated', { tasks: newTasks });
	}

	private createCheckpoint(): void {
		this.checkpointState = {
			status: this.state.status,
			tasks: JSON.parse(JSON.stringify(this.state.tasks)),
			currentTaskId: this.state.currentTaskId,
			timestamp: new Date()
		};
	}

	async restoreFromCheckpoint(): Promise<void> {
		if (this.checkpointState) {
			this.state.status = this.checkpointState.status;
			this.state.tasks = this.checkpointState.tasks;
			this.state.currentTaskId = this.checkpointState.currentTaskId;
			this.emit('checkpointRestored');
		}
	}

	getProgress(): number {
		if (this.state.tasks.length === 0) return 0;
		const completed = this.state.tasks.filter(t => t.status === 'completed').length;
		return Math.round((completed / this.state.tasks.length) * 100);
	}
}
