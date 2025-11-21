import { KnowledgeStore } from './KnowledgeStore';
import { KnowledgeItem } from './types';

export class Retriever {
	constructor(private store: KnowledgeStore) { }

	async retrieveRelevant(query: string, context: { tags?: string[], project?: string } = {}): Promise<KnowledgeItem[]> {
		// 1. Basic search
		let results = await this.store.search(query, context.tags);

		// 2. Filter by project context if provided
		if (context.project) {
			results = results.filter(item =>
				!item.context.project || item.context.project === context.project
			);
		}

		// 3. Rank by success rate (simple heuristic)
		results.sort((a, b) => b.metadata.successRate - a.metadata.successRate);

		return results.slice(0, 5); // Return top 5
	}
}
