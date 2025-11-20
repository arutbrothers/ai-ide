import { ModelProvider, GenerateOptions, ModelResponse } from '../types';

export class CommitteeAdapter implements ModelProvider {
    name = 'Committee';
    type: 'local' | 'api' = 'api';
    requiresAuth = false;
    supportsStreaming = false; // Hard to stream multiple responses coherently
    supportsTools = false;
    maxContextTokens = 4096;

    constructor(
        private providers: ModelProvider[],
        private judge?: ModelProvider,
        private votingPrompt: string = "Analyze the following responses and provide the best answer. If they agree, summarize. If they disagree, pick the correct one and explain."
    ) {
        if (providers.length < 2) {
            throw new Error('CommitteeAdapter requires at least two providers');
        }
        if (judge) {
            this.maxContextTokens = judge.maxContextTokens;
        }
    }

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
        // Run all providers in parallel
        const promises = this.providers.map(async (provider) => {
            try {
                const start = Date.now();
                const response = await provider.generate(prompt, options);
                const duration = Date.now() - start;
                return {
                    provider: provider.name,
                    content: response.content,
                    usage: response.usage,
                    error: null,
                    duration
                };
            } catch (error) {
                return {
                    provider: provider.name,
                    content: null,
                    usage: undefined,
                    error: (error as Error).message,
                    duration: 0
                };
            }
        });

        const results = await Promise.all(promises);

        // Aggregate usage
        let totalPrompt = 0;
        let totalCompletion = 0;

        for (const res of results) {
            if (res.usage) {
                totalPrompt += res.usage.promptTokens;
                totalCompletion += res.usage.completionTokens;
            }
        }

        // If we have a judge, let it decide
        if (this.judge) {
            const candidates = results.map((r, i) => `--- Model ${r.provider} ---\n${r.content}`).join('\n\n');
            const judgePrompt = `Original Prompt: ${prompt}\n\nResponses:\n${candidates}\n\n${this.votingPrompt}`;

            try {
                const verdict = await this.judge.generate(judgePrompt, options);

                // Add judge usage
                if (verdict.usage) {
                    totalPrompt += verdict.usage.promptTokens;
                    totalCompletion += verdict.usage.completionTokens;
                }

                return {
                    content: verdict.content,
                    usage: {
                        promptTokens: totalPrompt,
                        completionTokens: totalCompletion,
                        totalTokens: totalPrompt + totalCompletion
                    }
                };
            } catch (e) {
                console.warn('Judge failed, falling back to raw results', e);
                // Fallback to JSON below
            }
        }

        // Return as structured JSON in content
        const content = JSON.stringify({
            committee: true,
            timestamp: new Date(),
            results
        }, null, 2);

        return {
            content,
            usage: {
                promptTokens: totalPrompt,
                completionTokens: totalCompletion,
                totalTokens: totalPrompt + totalCompletion
            }
        };
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        throw new Error('Streaming not supported in Committee mode');
    }

    async isAvailable(): Promise<boolean> {
        const availabilities = await Promise.all(this.providers.map(p => p.isAvailable()));
        // Available if at least 2 are available
        return availabilities.filter(a => a).length >= 2;
    }

    async getInfo(): Promise<Record<string, any>> {
        return {
            name: this.name,
            members: await Promise.all(this.providers.map(p => p.getInfo())),
            type: this.type
        };
    }
}
