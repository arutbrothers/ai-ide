import { Agent, AgentConfig } from '@ai-ide/agent-runtime';
import { ArtifactStore } from '@ai-ide/artifact-system';
import { BrowserManager } from '@ai-ide/browser-control';
import { KnowledgeStore } from '@ai-ide/knowledge-base';
import { AdapterRegistry, OllamaAdapter, AnthropicAdapter, OpenAIAdapter } from '@ai-ide/model-provider';
import { EventEmitter } from 'events';

export class AgentService extends EventEmitter {
	private agents: Map<string, Agent> = new Map();
	private artifactStore: ArtifactStore;
	private knowledgeStore: KnowledgeStore;
	private browserManager: BrowserManager;
	private modelRegistry: AdapterRegistry;

	constructor(artifactsDbPath: string = './artifacts.db') {
		super();
		this.artifactStore = new ArtifactStore(artifactsDbPath);
		this.knowledgeStore = new KnowledgeStore();
		this.browserManager = new BrowserManager(this.artifactStore);
		this.modelRegistry = new AdapterRegistry();

		this.initializeModels();
	}

	private initializeModels() {
		// Register Ollama as default
		this.modelRegistry.register('ollama', new OllamaAdapter());
		this.modelRegistry.setDefault('ollama');

		// Register other providers if API keys are available
		if (process.env.ANTHROPIC_API_KEY) {
			this.modelRegistry.register('anthropic', new AnthropicAdapter(process.env.ANTHROPIC_API_KEY));
		}

		if (process.env.OPENAI_API_KEY) {
			this.modelRegistry.register('openai', new OpenAIAdapter(process.env.OPENAI_API_KEY));
		}
	}

	async createAgent(goal: string, config: Partial<AgentConfig>): Promise<string> {
		const agentConfig: AgentConfig = {
			id: config.id || `agent-${Date.now()}`,
			name: config.name || 'New Agent',
			role: config.role || 'developer',
			modelProviderId: config.modelProviderId || 'ollama',
			workspacePath: config.workspacePath || process.cwd()
		};

		const modelProvider = this.modelRegistry.get(agentConfig.modelProviderId) || this.modelRegistry.getDefault();

		const agent = new Agent(
			agentConfig,
			modelProvider,
			this.artifactStore,
			this.browserManager,
			this.knowledgeStore
		);

		this.agents.set(agent.id, agent);

		// Start agent execution in background
		this.executeAgentAsync(agent, goal);

		return agent.id;
	}

	private async executeAgentAsync(agent: Agent, goal: string) {
		try {
			await agent.start(goal);
			this.emit('agentCompleted', { agentId: agent.id, status: 'completed' });
		} catch (error) {
			this.emit('agentFailed', { agentId: agent.id, error: String(error) });
		}
	}

	async getAgent(agentId: string): Promise<Agent | undefined> {
		return this.agents.get(agentId);
	}

	async listAgents(): Promise<Agent[]> {
		return Array.from(this.agents.values());
	}

	async pauseAgent(agentId: string): Promise<void> {
		const agent = this.agents.get(agentId);
		if (agent) {
			await agent.pause();
			this.emit('agentPaused', { agentId });
		}
	}

	async resumeAgent(agentId: string): Promise<void> {
		const agent = this.agents.get(agentId);
		if (agent) {
			await agent.resume();
			this.emit('agentResumed', { agentId });
		}
	}

	async approveAgent(agentId: string): Promise<void> {
		const agent = this.agents.get(agentId);
		if (agent) {
			await agent.approve();
			this.emit('agentApproved', { agentId });
		}
	}

	async rejectAgent(agentId: string): Promise<void> {
		const agent = this.agents.get(agentId);
		if (agent) {
			await agent.reject();
			this.emit('agentRejected', { agentId });
		}
	}

	async getArtifacts(agentId: string) {
		return this.artifactStore.listArtifacts(agentId);
	}

	async addComment(artifactId: string, userId: string, content: string) {
		return this.artifactStore.addComment({
			artifactId,
			userId,
			content,
			resolved: false
		});
	}

	getKnowledgeStore(): KnowledgeStore {
		return this.knowledgeStore;
	}

	getBrowserManager(): BrowserManager {
		return this.browserManager;
	}

	getModelRegistry(): AdapterRegistry {
		return this.modelRegistry;
	}
}
