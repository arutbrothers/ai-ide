export interface KnowledgeItem {
    id: string;
    type: 'pattern' | 'snippet' | 'task_template' | 'decision';
    title: string;
    content: any;
    context: {
        project?: string;
        language?: string;
        framework?: string;
    };
    metadata: {
        usageCount: number;
        lastUsed: Date;
        successRate: number;
    };
    tags: string[];
}
