import * as fs from 'fs/promises';
import * as path from 'path';

export interface AIIDEConfig {
	// Model Configuration
	ollamaUrl?: string;
	defaultModel?: string;
	anthropicApiKey?: string;
	openaiApiKey?: string;

	// Agent Behavior
	autoApprove?: boolean;
	maxConcurrentAgents?: number;
	enableAutoVerification?: boolean;

	// Paths
	artifactsDbPath?: string;
	knowledgeDbPath?: string;
	checkpointDir?: string;

	// WebSocket
	wsPort?: number;

	// Browser
	browserHeadless?: boolean;
	browserRecordingEnabled?: boolean;
}

const DEFAULT_CONFIG: AIIDEConfig = {
	ollamaUrl: 'http://localhost:11434',
	defaultModel: 'ollama',
	autoApprove: false,
	maxConcurrentAgents: 2,
	enableAutoVerification: true,
	artifactsDbPath: './artifacts.db',
	knowledgeDbPath: './knowledge_vectors.json',
	checkpointDir: './agent_checkpoints',
	wsPort: 8080,
	browserHeadless: false,
	browserRecordingEnabled: true
};

export class ConfigManager {
	private config: AIIDEConfig = { ...DEFAULT_CONFIG };
	private configPath: string;

	constructor(workspaceRoot: string) {
		this.configPath = path.join(workspaceRoot, '.aiiderc.json');
	}

	async load(): Promise<AIIDEConfig> {
		try {
			const data = await fs.readFile(this.configPath, 'utf-8');
			const userConfig = JSON.parse(data);
			this.config = { ...DEFAULT_CONFIG, ...userConfig };
		} catch (error: any) {
			if (error.code === 'ENOENT') {
				// Config file doesn't exist, use defaults
				await this.save();
			} else {
				console.error('Error loading config:', error);
			}
		}
		return this.config;
	}

	async save(): Promise<void> {
		await fs.writeFile(
			this.configPath,
			JSON.stringify(this.config, null, 2),
			'utf-8'
		);
	}

	get(key: keyof AIIDEConfig): any {
		return this.config[key];
	}

	set(key: keyof AIIDEConfig, value: any): void {
		this.config[key] = value;
	}

	getAll(): AIIDEConfig {
		return { ...this.config };
	}

	async update(updates: Partial<AIIDEConfig>): Promise<void> {
		this.config = { ...this.config, ...updates };
		await this.save();
	}

	reset(): void {
		this.config = { ...DEFAULT_CONFIG };
	}
}
