import { ModelProvider } from '@ai-ide/model-provider';
import { Task } from './types';
import { PLANNER_PROMPT, AGENT_SYSTEM_PROMPT } from './prompts';

export class Planner {
	constructor(private modelProvider: ModelProvider) { }

	async createPlan(goal: string, context: string): Promise<Task[]> {
		const prompt = PLANNER_PROMPT
			.replace('{{goal}}', goal)
			.replace('{{context}}', context);

		const response = await this.modelProvider.generate(prompt, {
			temperature: 0.7,
			maxTokens: 2000,
			systemPrompt: AGENT_SYSTEM_PROMPT
		});

		try {
			const content = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
			const data = JSON.parse(content);

			if (!Array.isArray(data.tasks)) {
				throw new Error('Invalid plan format: tasks array missing');
			}

			return data.tasks.map((t: any, index: number) => ({
				id: `task-${index}`,
				description: t.description,
				status: 'pending',
				dependencies: t.dependencies || [],
				artifacts: [],
				metadata: {
					complexity: t.estimated_complexity
				},
			}));
		} catch (e) {
			console.error('Failed to parse plan', e);
			// Fallback: Create a single task if parsing fails
			return [{
				id: 'task-0',
				description: `Execute goal: ${goal}`,
				status: 'pending',
				dependencies: [],
				artifacts: [],
				metadata: {}
			}];
		}
	}
}
