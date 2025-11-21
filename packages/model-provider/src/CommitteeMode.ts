import { ModelProvider } from './types';

export interface CommitteeConfig {
	models: ModelProvider[];
	votingStrategy: 'majority' | 'unanimous' | 'weighted';
	weights?: number[]; // For weighted voting
	minAgreement?: number; // Minimum percentage for majority (default 0.5)
}

export interface CommitteeResponse {
	finalResponse: string;
	votes: { model: string; response: string; vote: string }[];
	agreement: number;
	consensus: boolean;
}

export class CommitteeMode {
	private config: CommitteeConfig;

	constructor(config: CommitteeConfig) {
		this.config = config;

		if (config.votingStrategy === 'weighted' && !config.weights) {
			throw new Error('Weights required for weighted voting strategy');
		}

		if (config.weights && config.weights.length !== config.models.length) {
			throw new Error('Number of weights must match number of models');
		}
	}

	async generate(prompt: string, options?: any): Promise<CommitteeResponse> {
		// Get responses from all models in parallel
		const responses = await Promise.all(
			this.config.models.map(async (model, index) => ({
				model: model.name || `Model ${index}`,
				response: await model.generate(prompt, options)
			}))
		);

		// Analyze responses and determine consensus
		const votes = this.analyzeResponses(responses);
		const finalResponse = this.selectFinalResponse(votes);
		const agreement = this.calculateAgreement(votes);
		const consensus = this.hasConsensus(agreement);

		return {
			finalResponse,
			votes,
			agreement,
			consensus
		};
	}

	private analyzeResponses(responses: { model: string; response: string }[]): { model: string; response: string; vote: string }[] {

		// For code/structured responses, extract key elements
		return responses.map(r => ({
			...r,
			vote: this.extractVote(r.response)
		}));
	}

	private extractVote(response: string): string {
		// Simple heuristic: use first 100 chars as vote signature
		// In practice, you'd use more sophisticated similarity metrics
		return response.substring(0, 100).trim();
	}

	private selectFinalResponse(votes: { model: string; response: string; vote: string }[]): string {
		switch (this.config.votingStrategy) {
			case 'majority':
				return this.majorityVote(votes);
			case 'unanimous':
				return this.unanimousVote(votes);
			case 'weighted':
				return this.weightedVote(votes);
			default:
				return votes[0].response;
		}
	}

	private majorityVote(votes: { model: string; response: string; vote: string }[]): string {
		// Count occurrences of each vote
		const voteCounts = new Map<string, { count: number; response: string }>();

		votes.forEach(v => {
			const existing = voteCounts.get(v.vote);
			if (existing) {
				existing.count++;
			} else {
				voteCounts.set(v.vote, { count: 1, response: v.response });
			}
		});

		// Find the vote with highest count
		let maxCount = 0;
		let winningResponse = votes[0].response;

		voteCounts.forEach(({ count, response }) => {
			if (count > maxCount) {
				maxCount = count;
				winningResponse = response;
			}
		});

		return winningResponse;
	}

	private unanimousVote(votes: { model: string; response: string; vote: string }[]): string {
		// Check if all votes are the same
		const firstVote = votes[0].vote;
		const allSame = votes.every(v => v.vote === firstVote);

		if (allSame) {
			return votes[0].response;
		}

		// If not unanimous, fall back to majority
		return this.majorityVote(votes);
	}

	private weightedVote(votes: { model: string; response: string; vote: string }[]): string {
		const weights = this.config.weights!;
		const voteScores = new Map<string, { score: number; response: string }>();

		votes.forEach((v, index) => {
			const existing = voteScores.get(v.vote);
			if (existing) {
				existing.score += weights[index];
			} else {
				voteScores.set(v.vote, { score: weights[index], response: v.response });
			}
		});

		// Find the vote with highest weighted score
		let maxScore = 0;
		let winningResponse = votes[0].response;

		voteScores.forEach(({ score, response }) => {
			if (score > maxScore) {
				maxScore = score;
				winningResponse = response;
			}
		});

		return winningResponse;
	}

	private calculateAgreement(votes: { model: string; response: string; vote: string }[]): number {
		if (votes.length === 0) return 0;

		// Count the most common vote
		const voteCounts = new Map<string, number>();
		votes.forEach(v => {
			voteCounts.set(v.vote, (voteCounts.get(v.vote) || 0) + 1);
		});

		const maxCount = Math.max(...Array.from(voteCounts.values()));
		return maxCount / votes.length;
	}

	private hasConsensus(agreement: number): boolean {
		const threshold = this.config.minAgreement || 0.5;
		return agreement >= threshold;
	}
}

export class ModelProviderWithFallback implements ModelProvider {
	name: string;
	private primaryProvider: ModelProvider;
	private fallbackProviders: ModelProvider[];
	private currentProviderIndex: number = 0;

	constructor(
		name: string,
		primaryProvider: ModelProvider,
		fallbackProviders: ModelProvider[]
	) {
		this.name = name;
		this.primaryProvider = primaryProvider;
		this.fallbackProviders = fallbackProviders;
	}

	async generate(prompt: string, options?: any): Promise<string> {
		try {
			return await this.primaryProvider.generate(prompt, options);
		} catch (error) {
			console.warn(`Primary provider failed: ${error}`);
			return await this.tryFallbacks(prompt, options);
		}
	}

	private async tryFallbacks(prompt: string, options?: any): Promise<string> {
		for (let i = 0; i < this.fallbackProviders.length; i++) {
			try {
				console.log(`Trying fallback provider ${i + 1}/${this.fallbackProviders.length}`);
				const response = await this.fallbackProviders[i].generate(prompt, options);
				this.currentProviderIndex = i + 1;
				return response;
			} catch (error) {
				console.warn(`Fallback provider ${i + 1} failed: ${error}`);
				if (i === this.fallbackProviders.length - 1) {
					throw new Error('All providers failed');
				}
			}
		}

		throw new Error('All providers failed');
	}

	getCurrentProvider(): string {
		if (this.currentProviderIndex === 0) {
			return this.primaryProvider.name || 'primary';
		}
		return this.fallbackProviders[this.currentProviderIndex - 1].name || `fallback-${this.currentProviderIndex}`;
	}
}

export class TaskComplexityRouter {
	private simpleProvider: ModelProvider;
	private complexProvider: ModelProvider;
	private complexityThreshold: number;

	constructor(
		simpleProvider: ModelProvider,
		complexProvider: ModelProvider,
		complexityThreshold: number = 0.5
	) {
		this.simpleProvider = simpleProvider;
		this.complexProvider = complexProvider;
		this.complexityThreshold = complexityThreshold;
	}

	async generate(prompt: string, options?: any): Promise<string> {
		const complexity = this.estimateComplexity(prompt);

		if (complexity >= this.complexityThreshold) {
			console.log(`Using complex provider (complexity: ${complexity})`);
			return await this.complexProvider.generate(prompt, options);
		} else {
			console.log(`Using simple provider (complexity: ${complexity})`);
			return await this.simpleProvider.generate(prompt, options);
		}
	}

	private estimateComplexity(prompt: string): number {
		let score = 0;

		// Length-based scoring
		if (prompt.length > 1000) score += 0.2;
		if (prompt.length > 2000) score += 0.2;

		// Keyword-based scoring
		const complexKeywords = [
			'refactor', 'architecture', 'design', 'optimize',
			'algorithm', 'performance', 'security', 'scale'
		];

		const keywordCount = complexKeywords.filter(kw =>
			prompt.toLowerCase().includes(kw)
		).length;

		score += Math.min(keywordCount * 0.1, 0.3);

		// Code block presence
		if (prompt.includes('```')) score += 0.2;

		// Multiple steps/requirements
		const stepIndicators = ['1.', '2.', '3.', 'first', 'second', 'then', 'finally'];
		const stepCount = stepIndicators.filter(ind =>
			prompt.toLowerCase().includes(ind)
		).length;

		score += Math.min(stepCount * 0.05, 0.2);

		return Math.min(score, 1.0);
	}
}
