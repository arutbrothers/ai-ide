import { Level } from 'level';
import * as path from 'path';

export class KnowledgeStore {
    private db: Level<string, any>;

    constructor(storagePath: string) {
        const dbPath = path.join(storagePath, 'knowledge-base');
        this.db = new Level(dbPath, { valueEncoding: 'json' });
    }

    public async add(item: any): Promise<void> {
        await this.db.put(item.id, item);
    }
}
