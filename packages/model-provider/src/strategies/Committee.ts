import { ModelProvider, GenerateOptions } from '../types';

export class CommitteeAdapter implements ModelProvider {
    name = 'Committee';
    type: 'local' | 'api' = 'api';
    requiresAuth = false;
    supportsStreaming = false; // Hard to stream multiple responses coherently
    supportsTools = false;
    maxContextTokens = 4096;

    constructor(private providers: ModelProvider[]) {
        if (providers.length < 2) {
            throw new Error('CommitteeAdapter requires at least two providers');
        }
    }

    async generate(prompt: string, options: GenerateOptions): Promise<string> {
        // Run all providers in parallel
        const promises = this.providers.map(async (provider) => {
            try {
                const start = Date.now();
                const content = await provider.generate(prompt, options);
                const duration = Date.now() - start;
                return {
                    provider: provider.name,
                    content,
                    error: null,
                    duration
                };
            } catch (error) {
                return {
                    provider: provider.name,
                    content: null,
                    error: (error as Error).message,
                    duration: 0
                };
            }
        });

        const results = await Promise.all(promises);

        // Return as structured JSON
        return JSON.stringify({
            committee: true,
            timestamp: new Date(),
            results
        }, null, 2);
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        throw new Error('Streaming not supported in Committee mode');
    }

    async isAvailable(): Promise<boolean> {
        const availabilities = await Promise.all(this.providers.map(p => p.isAvailable()));
        // Available if at least 2 are available? Or all?
        // Let's say available if we have at least 2 to form a committee.
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
