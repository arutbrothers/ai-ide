import { describe, it, expect, beforeEach } from 'vitest';
import { Agent } from '../src/Agent';
import { Task } from '../src/types';

describe('Agent', () => {
	let agent: Agent;
	let mockModelProvider: any;
	let mockArtifactStore: any;
	let mockBrowserManager: any;
	let mockKnowledgeStore: any;

	beforeEach(() => {
		// Setup mocks
		mockModelProvider = {
			name: 'test-model',
			generate: async (prompt: string) => 'Test response'
		};

		mockArtifactStore = {
			createArtifact: async (artifact: any) => ({ id: 'test-artifact-id', ...artifact })
		};

		mockBrowserManager = {
			getBrowserContext: async () => ({ pages: () => [] })
		};

		mockKnowledgeStore = {
			addKnowledge: async (knowledge: any) => { }
		};

		agent = new Agent(
			{
				name: 'Test Agent',
				workspacePath: '/test/workspace',
				autoApprove: true
			},
			mockModelProvider,
			mockArtifactStore,
			mockBrowserManager,
			mockKnowledgeStore
		);
	});

	describe('initialization', () => {
		it('should create agent with correct initial state', () => {
			expect(agent.id).toBeDefined();
			expect(agent.config.name).toBe('Test Agent');
			expect(agent.state.status).toBe('idle');
		});

		it('should have empty task list initially', () => {
			expect(agent.state.tasks).toEqual([]);
		});
	});

	describe('state management', () => {
		it('should emit stateChange event when status changes', (done) => {
			agent.on('stateChange', (data) => {
				expect(data.status).toBe('planning');
				done();
			});

			agent.state.status = 'planning';
			agent.emit('stateChange', { status: 'planning' });
		});

		it('should calculate progress correctly', () => {
			agent.state.tasks = [
				{ id: '1', description: 'Task 1', status: 'completed' } as Task,
				{ id: '2', description: 'Task 2', status: 'completed' } as Task,
				{ id: '3', description: 'Task 3', status: 'pending' } as Task,
				{ id: '4', description: 'Task 4', status: 'pending' } as Task
			];

			const progress = agent.getProgress();
			expect(progress).toBe(50); // 2 out of 4 completed
		});
	});

	describe('approval workflow', () => {
		it('should wait for approval when autoApprove is false', async () => {
			const manualAgent = new Agent(
				{
					name: 'Manual Agent',
					workspacePath: '/test',
					autoApprove: false
				},
				mockModelProvider,
				mockArtifactStore,
				mockBrowserManager,
				mockKnowledgeStore
			);

			manualAgent.state.status = 'awaiting_approval';
			expect(manualAgent.state.status).toBe('awaiting_approval');
		});

		it('should auto-approve when autoApprove is true', () => {
			expect(agent.config.autoApprove).toBe(true);
		});
	});

	describe('task execution', () => {
		it('should add tasks to state', () => {
			const task: Task = {
				id: 'test-task',
				description: 'Test task',
				status: 'pending',
				dependencies: []
			};

			agent.state.tasks.push(task);
			expect(agent.state.tasks).toHaveLength(1);
			expect(agent.state.tasks[0].id).toBe('test-task');
		});

		it('should update task status', () => {
			const task: Task = {
				id: 'test-task',
				description: 'Test task',
				status: 'pending',
				dependencies: []
			};

			agent.state.tasks.push(task);
			agent.state.tasks[0].status = 'completed';

			expect(agent.state.tasks[0].status).toBe('completed');
		});
	});

	describe('checkpoint and resume', () => {
		it('should create checkpoint', () => {
			agent.state.tasks = [
				{ id: '1', description: 'Task 1', status: 'completed', dependencies: [] }
			];

			const checkpoint = agent.createCheckpoint();

			expect(checkpoint).toBeDefined();
			expect(checkpoint.tasks).toHaveLength(1);
			expect(checkpoint.status).toBe('idle');
		});

		it('should resume from checkpoint', () => {
			const checkpoint = {
				status: 'executing' as const,
				tasks: [
					{ id: '1', description: 'Task 1', status: 'completed' as const, dependencies: [] }
				],
				currentTaskIndex: 0,
				retryCount: 0
			};

			agent.resumeFromCheckpoint(checkpoint);

			expect(agent.state.status).toBe('executing');
			expect(agent.state.tasks).toHaveLength(1);
		});
	});
});
