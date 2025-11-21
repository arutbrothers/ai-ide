import { describe, it, expect } from 'vitest';
import { CommitteeMode, ModelProviderWithFallback, TaskComplexityRouter } from '../src/CommitteeMode';

describe('CommitteeMode', () => {
	const mockModel1 = {
		name: 'model-1',
		generate: async (prompt: string) => 'Response from model 1'
	};

	const mockModel2 = {
		name: 'model-2',
		generate: async (prompt: string) => 'Response from model 2'
	};

	const mockModel3 = {
		name: 'model-3',
		generate: async (prompt: string) => 'Response from model 1' // Same as model 1
	};

	describe('majority voting', () => {
		it('should select majority response', async () => {
			const committee = new CommitteeMode({
				models: [mockModel1, mockModel2, mockModel3],
				votingStrategy: 'majority'
			});

			const result = await committee.generate('test prompt');

			expect(result.finalResponse).toBe('Response from model 1');
			expect(result.agreement).toBeGreaterThan(0.5);
		});
	});

	describe('weighted voting', () => {
		it('should use weights for voting', async () => {
			const committee = new CommitteeMode({
				models: [mockModel1, mockModel2, mockModel3],
				votingStrategy: 'weighted',
				weights: [0.5, 0.3, 0.2]
			});

			const result = await committee.generate('test prompt');

			expect(result.votes).toHaveLength(3);
			expect(result.finalResponse).toBeDefined();
		});

		it('should throw error if weights missing', () => {
			expect(() => {
				new CommitteeMode({
					models: [mockModel1, mockModel2],
					votingStrategy: 'weighted'
				});
			}).toThrow('Weights required');
		});
	});

	describe('consensus detection', () => {
		it('should detect consensus', async () => {
			const committee = new CommitteeMode({
				models: [mockModel1, mockModel3], // Both return same response
				votingStrategy: 'unanimous'
			});

			const result = await committee.generate('test prompt');

			expect(result.consensus).toBe(true);
			expect(result.agreement).toBe(1.0);
		});
	});
});

describe('ModelProviderWithFallback', () => {
	const primaryModel = {
		name: 'primary',
		generate: async (prompt: string) => {
			throw new Error('Primary failed');
		}
	};

	const fallbackModel = {
		name: 'fallback',
		generate: async (prompt: string) => 'Fallback response'
	};

	it('should use fallback when primary fails', async () => {
		const provider = new ModelProviderWithFallback(
			'resilient-provider',
			primaryModel,
			[fallbackModel]
		);

		const response = await provider.generate('test prompt');
		expect(response).toBe('Fallback response');
	});

	it('should track current provider', async () => {
		const provider = new ModelProviderWithFallback(
			'resilient-provider',
			primaryModel,
			[fallbackModel]
		);

		await provider.generate('test prompt');
		expect(provider.getCurrentProvider()).toBe('fallback');
	});
});

describe('TaskComplexityRouter', () => {
	const simpleModel = {
		name: 'simple',
		generate: async (prompt: string) => 'Simple response'
	};

	const complexModel = {
		name: 'complex',
		generate: async (prompt: string) => 'Complex response'
	};

	it('should route simple tasks to simple model', async () => {
		const router = new TaskComplexityRouter(simpleModel, complexModel, 0.5);

		const response = await router.generate('Hello world');
		expect(response).toBe('Simple response');
	});

	it('should route complex tasks to complex model', async () => {
		const router = new TaskComplexityRouter(simpleModel, complexModel, 0.3);

		const complexPrompt = `
			Refactor this architecture to use microservices.
			Design a scalable solution with proper security.
			\`\`\`typescript
			// complex code here
			\`\`\`
		`;

		const response = await router.generate(complexPrompt);
		expect(response).toBe('Complex response');
	});
});
