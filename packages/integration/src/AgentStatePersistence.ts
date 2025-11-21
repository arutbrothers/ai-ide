import * as fs from 'fs/promises';
import * as path from 'path';
import { Agent } from '@ai-ide/agent-runtime';

interface AgentCheckpoint {
	agentId: string;
	config: any;
	state: any;
	timestamp: Date;
}

export class AgentStatePersistence {
	private checkpointDir: string;

	constructor(checkpointDir: string = './agent_checkpoints') {
		this.checkpointDir = checkpointDir;
	}

	async saveAgentState(agent: Agent): Promise<void> {
		await fs.mkdir(this.checkpointDir, { recursive: true });

		const checkpoint: AgentCheckpoint = {
			agentId: agent.id,
			config: agent.config,
			state: agent.state,
			timestamp: new Date()
		};

		const filePath = path.join(this.checkpointDir, `${agent.id}.json`);
		await fs.writeFile(filePath, JSON.stringify(checkpoint, null, 2));
	}

	async loadAgentState(agentId: string): Promise<AgentCheckpoint | null> {
		try {
			const filePath = path.join(this.checkpointDir, `${agentId}.json`);
			const data = await fs.readFile(filePath, 'utf-8');
			return JSON.parse(data);
		} catch (error: any) {
			if (error.code === 'ENOENT') {
				return null;
			}
			throw error;
		}
	}

	async listCheckpoints(): Promise<string[]> {
		try {
			const files = await fs.readdir(this.checkpointDir);
			return files
				.filter(f => f.endsWith('.json'))
				.map(f => f.replace('.json', ''));
		} catch (error: any) {
			if (error.code === 'ENOENT') {
				return [];
			}
			throw error;
		}
	}

	async deleteCheckpoint(agentId: string): Promise<void> {
		const filePath = path.join(this.checkpointDir, `${agentId}.json`);
		await fs.unlink(filePath);
	}

	async clearAll(): Promise<void> {
		try {
			const files = await fs.readdir(this.checkpointDir);
			await Promise.all(
				files.map(f => fs.unlink(path.join(this.checkpointDir, f)))
			);
		} catch (error: any) {
			if (error.code !== 'ENOENT') {
				throw error;
			}
		}
	}
}
