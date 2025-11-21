export interface KnowledgeItem {
	id: string;
	type: 'pattern' | 'snippet' | 'task_template' | 'decision';
	title: string;
	content: string;
	context: {
		project?: string;
		language?: string;
		framework?: string;
	};
	metadata: {
		usageCount: number;
		lastUsed: Date;
		successRate: number; // % of times it worked
	};
	tags: string[];
}
