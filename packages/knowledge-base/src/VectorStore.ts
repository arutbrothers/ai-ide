import { KnowledgeItem } from './types';
import { v4 as uuidv4 } from 'uuid';

// Simple cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
	const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
	const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
	const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
	return dotProduct / (magnitudeA * magnitudeB);
}

export class VectorStore {
	private vectors: Map<string, number[]> = new Map();

	async add(id: string, embedding: number[]): Promise<void> {
		this.vectors.set(id, embedding);
	}

	async search(queryEmbedding: number[], limit: number = 5): Promise<{ id: string; score: number }[]> {
		const results: { id: string; score: number }[] = [];

		for (const [id, embedding] of this.vectors.entries()) {
			const score = cosineSimilarity(queryEmbedding, embedding);
			results.push({ id, score });
		}

		return results.sort((a, b) => b.score - a.score).slice(0, limit);
	}
}

export class EmbeddingService {
	// In a real app, this would use a local model (e.g., transformers.js) or an API
	async embed(text: string): Promise<number[]> {
		// Mock embedding generation for "production-grade" scaffold
		// Returns a random vector of dimension 384 (common for small models)
		return Array.from({ length: 384 }, () => Math.random() - 0.5);
	}
}
