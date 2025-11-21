import * as vscode from 'vscode';
import * as sqlite3 from '@vscode/sqlite3';
import * as path from 'path';
import * as fs from 'fs';

export class ArtifactStore {
    private db: sqlite3.Database;

    constructor(storagePath: string) {
        if (!fs.existsSync(storagePath)) {
            fs.mkdirSync(storagePath);
        }
        const dbPath = path.join(storagePath, 'artifacts.db');
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error(err.message);
                vscode.window.showErrorMessage('Failed to open artifact database.');
            } else {
                console.log('Connected to the artifact database.');
                this.init();
            }
        });
    }

    private init() {
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS artifacts (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    agent_id TEXT,
                    task_id TEXT,
                    content BLOB,
                    metadata TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            this.db.run(`
                CREATE TABLE IF NOT EXISTS comments (
                    id TEXT PRIMARY KEY,
                    artifact_id TEXT NOT NULL,
                    author TEXT NOT NULL,
                    content TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (artifact_id) REFERENCES artifacts(id)
                )
            `);
        });
    }

    public create(artifact: { id: string, type: string, agent_id?: string, task_id?: string, content: any, metadata?: any }): Promise<void> {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('INSERT INTO artifacts (id, type, agent_id, task_id, content, metadata) VALUES (?, ?, ?, ?, ?, ?)');
            stmt.run(
                artifact.id,
                artifact.type,
                artifact.agent_id,
                artifact.task_id,
                Buffer.from(JSON.stringify(artifact.content)),
                JSON.stringify(artifact.metadata),
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
            stmt.finalize();
        });
    }

    public get(id: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM artifacts WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        row.content = JSON.parse(row.content.toString());
                        row.metadata = JSON.parse(row.metadata);
                    }
                    resolve(row);
                }
            });
        });
    }

    public list(agentId: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM artifacts WHERE agent_id = ?', [agentId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    rows.forEach(row => {
                        row.content = JSON.parse(row.content.toString());
                        row.metadata = JSON.parse(row.metadata);
                    });
                    resolve(rows);
                }
            });
        });
    }

    public delete(id: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM artifacts WHERE id = ?', [id], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public search(query: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM artifacts WHERE type LIKE ? OR content LIKE ?', [`%${query}%`, `%${query}%`], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    rows.forEach(row => {
                        row.content = JSON.parse(row.content.toString());
                        row.metadata = JSON.parse(row.metadata);
                    });
                    resolve(rows);
                }
            });
        });
    }
}
