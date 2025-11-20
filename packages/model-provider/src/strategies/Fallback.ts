import { ModelProvider, GenerateOptions, Message, Tool } from '../types';

export class FallbackAdapter implements ModelProvider {
    name = 'Fallback';
    type: 'local' | 'api' = 'local';
    requiresAuth = false;
    supportsStreaming = true;
    supportsTools = true;
    maxContextTokens = 4096;

    constructor(private providers: ModelProvider[]) {
        if (providers.length === 0) {
            throw new Error('FallbackAdapter requires at least one provider');
        }
        // Inherit capabilities from the first provider (primary)
        this.supportsStreaming = providers[0].supportsStreaming;
        this.supportsTools = providers[0].supportsTools;
        this.maxContextTokens = providers[0].maxContextTokens;
    }

    async generate(prompt: string, options: GenerateOptions): Promise<string> {
        const errors: Error[] = [];

        for (const provider of this.providers) {
            try {
                if (await provider.isAvailable()) {
                    return await provider.generate(prompt, options);
                }
            } catch (error) {
                errors.push(error as Error);
                console.warn(`Provider ${provider.name} failed in fallback:`, error);
            }
        }

        throw new Error(`All providers failed. Errors: ${errors.map(e => e.message).join(', ')}`);
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        const errors: Error[] = [];

        for (const provider of this.providers) {
            try {
                if (await provider.isAvailable()) {
                    const stream = provider.generateStream(prompt, options);
                    for await (const chunk of stream) {
                        yield chunk;
                    }
                    return;
                }
            } catch (error) {
                errors.push(error as Error);
                console.warn(`Provider ${provider.name} failed in fallback (stream):`, error);
            }
        }

        throw new Error(`All providers failed. Errors: ${errors.map(e => e.message).join(', ')}`);
    }

    async isAvailable(): Promise<boolean> {
        for (const provider of this.providers) {
            if (await provider.isAvailable()) return true;
        }
        return false;
    }

    async getInfo(): Promise<Record<string, any>> {
        return {
            name: this.name,
            providers: await Promise.all(this.providers.map(p => p.getInfo())),
            type: this.type
        };
    }
}
