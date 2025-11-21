import { describe, it, expect, beforeEach } from 'vitest';
import { PersistentVectorStore } from '../src/PersistentVectorStore';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('PersistentVectorStore', () => {
	let store: PersistentVectorStore;
	const testDbPath = './test_vectors.json';

	beforeEach(async () => {
		// Clean up test file if exists
		try {
			await fs.unlink(testDbPath);
		} catch (error) {
			// File doesn't exist, ignore
		}

		store = new PersistentVectorStore(testDbPath);
	});

	afterEach(async () => {
		// Clean up
		try {
			await fs.unlink(testDbPath);
		} catch (error) {
			// Ignore
		}
	});

	describe('persistence', () => {
		it('should save vectors to file', async () => {
			await store.add('test-id', [0.1, 0.2, 0.3], { type: 'test' });
			await store.save();

			const fileExists = await fs.access(testDbPath).then(() => true).catch(() => false);
			expect(fileExists).toBe(true);
		});

		it('should load vectors from file', async () => {
			await store.add('test-id', [0.1, 0.2, 0.3], { type: 'test' });
			await store.save();

			const newStore = new PersistentVectorStore(testDbPath);
			await newStore.load();

			const results = await newStore.search([0.1, 0.2, 0.3], 1);
			expect(results).toHaveLength(1);
			expect(results[0].id).toBe('test-id');
		});

		it('should auto-save periodically', async () => {
			await store.add('test-id', [0.1, 0.2, 0.3], { type: 'test' });

			// Wait for auto-save (5 seconds + buffer)
			await new Promise(resolve => setTimeout(resolve, 6000));

			const fileExists = await fs.access(testDbPath).then(() => true).catch(() => false);
			expect(fileExists).toBe(true);
		}, 10000);
	});

	describe('vector operations', () => {
		it('should add and retrieve vectors', async () => {
			await store.add('test-1', [0.1, 0.2, 0.3], { type: 'test' });

			const results = await store.search([0.1, 0.2, 0.3], 1);
			expect(results).toHaveLength(1);
			expect(results[0].id).toBe('test-1');
		});

		it('should find similar vectors', async () => {
			await store.add('test-1', [0.1, 0.2, 0.3], { type: 'test' });
			await store.add('test-2', [0.15, 0.25, 0.35], { type: 'test' });
			await store.add('test-3', [0.9, 0.8, 0.7], { type: 'test' });

			const results = await store.search([0.1, 0.2, 0.3], 2);
			expect(results).toHaveLength(2);
			expect(results[0].id).toBe('test-1');
			expect(results[1].id).toBe('test-2');
		});

		it('should remove vectors', async () => {
			await store.add('test-1', [0.1, 0.2, 0.3], { type: 'test' });
			await store.add('test-2', [0.4, 0.5, 0.6], { type: 'test' });

			await store.remove('test-1');

			const results = await store.search([0.1, 0.2, 0.3], 10);
			expect(results).toHaveLength(1);
			expect(results[0].id).toBe('test-2');
		});
	});
});
