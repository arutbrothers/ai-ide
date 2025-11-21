import { Artifact, Comment } from './types';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';

export class ArtifactStore {
	private db: Database;

	constructor(dbPath: string = ':memory:') {
		this.db = new sqlite3.Database(dbPath);
		this.init();
	}

	private init() {
		this.db.serialize(() => {
			this.db.run(`
        CREATE TABLE IF NOT EXISTS artifacts (
          id TEXT PRIMARY KEY,
          agentId TEXT,
          taskId TEXT,
          type TEXT,
          title TEXT,
          content TEXT,
          metadata TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          status TEXT
        )
      `);

			this.db.run(`
        CREATE TABLE IF NOT EXISTS comments (
          id TEXT PRIMARY KEY,
          artifactId TEXT,
          userId TEXT,
          content TEXT,
          position TEXT,
          createdAt TEXT,
          resolved INTEGER
        )
      `);
		});
	}

	async createArtifact(artifact: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artifact> {
		const newArtifact: Artifact = {
			...artifact,
			id: uuidv4(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		return new Promise((resolve, reject) => {
			this.db.run(
				`INSERT INTO artifacts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					newArtifact.id,
					newArtifact.agentId,
					newArtifact.taskId,
					newArtifact.type,
					newArtifact.title,
					JSON.stringify(newArtifact.content),
					JSON.stringify(newArtifact.metadata),
					newArtifact.createdAt.toISOString(),
					newArtifact.updatedAt.toISOString(),
					newArtifact.status
				],
				(err) => {
					if (err) reject(err);
					else resolve(newArtifact);
				}
			);
		});
	}

	async getArtifact(id: string): Promise<Artifact | undefined> {
		return new Promise((resolve, reject) => {
			this.db.get(`SELECT * FROM artifacts WHERE id = ?`, [id], (err, row: any) => {
				if (err) reject(err);
				else if (!row) resolve(undefined);
				else resolve({
					...row,
					content: JSON.parse(row.content),
					metadata: JSON.parse(row.metadata),
					createdAt: new Date(row.createdAt),
					updatedAt: new Date(row.updatedAt)
				});
			});
		});
	}

	async listArtifacts(agentId?: string): Promise<Artifact[]> {
		const query = agentId
			? `SELECT * FROM artifacts WHERE agentId = ?`
			: `SELECT * FROM artifacts`;
		const params = agentId ? [agentId] : [];

		return new Promise((resolve, reject) => {
			this.db.all(query, params, (err, rows: any[]) => {
				if (err) reject(err);
				else resolve(rows.map(row => ({
					...row,
					content: JSON.parse(row.content),
					metadata: JSON.parse(row.metadata),
					createdAt: new Date(row.createdAt),
					updatedAt: new Date(row.updatedAt)
				})));
			});
		});
	}

	async updateArtifact(id: string, updates: Partial<Artifact>): Promise<Artifact> {
		const artifact = await this.getArtifact(id);
		if (!artifact) throw new Error(`Artifact ${id} not found`);

		const updated = { ...artifact, ...updates, updatedAt: new Date() };

		return new Promise((resolve, reject) => {
			this.db.run(
				`UPDATE artifacts SET
          title = ?, content = ?, metadata = ?, updatedAt = ?, status = ?
         WHERE id = ?`,
				[
					updated.title,
					JSON.stringify(updated.content),
					JSON.stringify(updated.metadata),
					updated.updatedAt.toISOString(),
					updated.status,
					id
				],
				(err) => {
					if (err) reject(err);
					else resolve(updated);
				}
			);
		});
	}

	async addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
		const newComment: Comment = {
			...comment,
			id: uuidv4(),
			createdAt: new Date(),
			resolved: false,
		};

		return new Promise((resolve, reject) => {
			this.db.run(
				`INSERT INTO comments VALUES (?, ?, ?, ?, ?, ?, ?)`,
				[
					newComment.id,
					newComment.artifactId,
					newComment.userId,
					newComment.content,
					JSON.stringify(newComment.position),
					newComment.createdAt.toISOString(),
					newComment.resolved ? 1 : 0
				],
				(err) => {
					if (err) reject(err);
					else resolve(newComment);
				}
			);
		});
	}

	async getComments(artifactId: string): Promise<Comment[]> {
		return new Promise((resolve, reject) => {
			this.db.all(
				`SELECT * FROM comments WHERE artifactId = ?`,
				[artifactId],
				(err, rows: any[]) => {
					if (err) reject(err);
					else resolve(rows.map(row => ({
						...row,
						position: JSON.parse(row.position),
						createdAt: new Date(row.createdAt),
						resolved: row.resolved === 1
					})));
				}
			);
		});
	}
}
