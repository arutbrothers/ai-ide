import { VectorStore } from './VectorStore';
import { KnowledgeItem } from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

interface PersistedVector {
	id: string;
	embedding: number[];
	metadata: any;
}

export class PersistentVectorStore extends VectorStore {
	private dbPath: string;
	private saveInterval: NodeJS.Timeout | null = null;

	constructor(dbPath: string = './knowledge_vectors.json') {
		super();
		this.dbPath = dbPath;
	}

	async initialize(): Promise<void> {
		await this.load();

		// Auto-save every 5 minutes
		this.saveInterval = setInterval(() => {
			this.save().catch(console.error);
		}, 5 * 60 * 1000);
	}

	async load(): Promise<void> {
		try {
			const data = await fs.readFile(this.dbPath, 'utf-8');
			const persisted: PersistedVector[] = JSON.parse(data);

			// Restore vectors
			for (const item of persisted) {
				this.vectors.set(item.id, item.embedding);
				this.metadata.set(item.id, item.metadata);
			}

			console.log(`Loaded ${persisted.length} vectors from ${this.dbPath}`);
		} catch (error: any) {
			if (error.code === 'ENOENT') {
				console.log('No existing vector database found, starting fresh');
			} else {
				console.error('Error loading vector database:', error);
			}
		}
	}

	async save(): Promise<void> {
		const persisted: PersistedVector[] = [];

		for (const [id, embedding] of this.vectors) {
			persisted.push({
				id,
				embedding,
				metadata: this.metadata.get(id)
			});
		}

		await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
		await fs.writeFile(this.dbPath, JSON.stringify(persisted, null, 2));

		console.log(`Saved ${persisted.length} vectors to ${this.dbPath}`);
	}

	async close(): Promise<void> {
		if (this.saveInterval) {
			clearInterval(this.saveInterval);
		}
		await this.save();
	}

	override async add(id: string, embedding: number[], metadata?: any): Promise<void> {
		await super.add(id, embedding, metadata);
		// Trigger save after adding
		await this.save();
	}

	override async remove(id: string): Promise<void> {
		await super.remove(id);
		// Trigger save after removing
		await this.save();
	}
}
