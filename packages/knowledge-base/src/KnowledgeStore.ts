import { KnowledgeItem } from './types';
import { v4 as uuidv4 } from 'uuid';
import { VectorStore, EmbeddingService } from './VectorStore';

export class KnowledgeStore {
	private items: Map<string, KnowledgeItem> = new Map();
	private vectorStore: VectorStore;
	private embeddingService: EmbeddingService;

	constructor() {
		this.vectorStore = new VectorStore();
		this.embeddingService = new EmbeddingService();
	}

	async add(item: Omit<KnowledgeItem, 'id' | 'metadata'>): Promise<KnowledgeItem> {
		const newItem: KnowledgeItem = {
			...item,
			id: uuidv4(),
			metadata: {
				usageCount: 0,
				lastUsed: new Date(),
				successRate: 100,
			},
		};

		this.items.set(newItem.id, newItem);

		// Generate and store embedding
		const textToEmbed = `${newItem.title} ${newItem.content} ${newItem.tags.join(' ')}`;
		const embedding = await this.embeddingService.embed(textToEmbed);
		await this.vectorStore.add(newItem.id, embedding);

		return newItem;
	}

	async search(query: string, tags?: string[]): Promise<KnowledgeItem[]> {
		// 1. Semantic Search
		const queryEmbedding = await this.embeddingService.embed(query);
		const semanticResults = await this.vectorStore.search(queryEmbedding, 20); // Get top 20 semantic matches

		const results: KnowledgeItem[] = [];

		for (const res of semanticResults) {
			const item = this.items.get(res.id);
			if (item) {
				// 2. Filter by tags if provided
				if (tags && tags.length > 0) {
					if (!tags.some(t => item.tags.includes(t))) continue;
				}
				results.push(item);
			}
		}

		return results;
	}

	async get(id: string): Promise<KnowledgeItem | undefined> {
		return this.items.get(id);
	}

	async update(id: string, updates: Partial<KnowledgeItem>): Promise<KnowledgeItem> {
		const item = this.items.get(id);
		if (!item) throw new Error(`Knowledge item ${id} not found`);

		const updated = { ...item, ...updates };
		this.items.set(id, updated);

		// Re-embed if content changed
		if (updates.title || updates.content || updates.tags) {
			const textToEmbed = `${updated.title} ${updated.content} ${updated.tags.join(' ')}`;
			const embedding = await this.embeddingService.embed(textToEmbed);
			await this.vectorStore.add(updated.id, embedding);
		}

		return updated;
	}

	async delete(id: string): Promise<void> {
		this.items.delete(id);
		// Note: VectorStore delete not implemented in this scaffold, but would be here
	}
}
