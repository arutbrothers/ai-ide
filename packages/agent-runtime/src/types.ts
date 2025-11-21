import { Artifact } from '@ai-ide/artifact-system';

export interface Task {
	id: string;
	description: string;
	status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
	dependencies: string[];
	artifacts: string[]; // IDs
	metadata: Record<string, any>;
}

export interface AgentConfig {
	id: string;
	name: string;
	role: string;
	modelProviderId: string;
	workspacePath: string;
}

export interface AgentState {
	status: 'idle' | 'planning' | 'executing' | 'paused' | 'completed' | 'failed';
	currentTaskId?: string;
	tasks: Task[];
	artifacts: string[]; // IDs
}
