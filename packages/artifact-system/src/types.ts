export type ArtifactType =
	| 'implementation_plan'
	| 'task_list'
	| 'code_diff'
	| 'test_result'
	| 'screenshot'
	| 'walkthrough_recording'
	| 'research_notes'
	| 'browser_action';

export interface Artifact {
	id: string;
	agentId: string;
	taskId?: string;
	type: ArtifactType;
	title: string;
	content: any; // JSON content or path to file
	metadata: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
	status: 'draft' | 'pending_review' | 'approved' | 'rejected';
}

export interface Comment {
	id: string;
	artifactId: string;
	userId: string;
	content: string;
	position?: {
		line?: number;
		x?: number;
		y?: number;
	};
	createdAt: Date;
	resolved: boolean;
}
