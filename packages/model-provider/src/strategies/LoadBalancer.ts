import { ModelProvider, GenerateOptions, Message, Tool, ModelResponse } from '../types';

export class LoadBalancerAdapter implements ModelProvider {
    name = 'LoadBalancer';
    type: 'local' | 'api' = 'api';
    requiresAuth = false;
    supportsStreaming = true;
    supportsTools = true;
    maxContextTokens = 4096;

    private currentIndex = 0;

    constructor(private providers: ModelProvider[]) {
        if (providers.length === 0) {
            throw new Error('LoadBalancerAdapter requires at least one provider');
        }
        // Inherit from first
        this.supportsStreaming = providers[0].supportsStreaming;
        this.supportsTools = providers[0].supportsTools;
        this.maxContextTokens = providers[0].maxContextTokens;
    }

    private getNextProvider(): ModelProvider {
        const provider = this.providers[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.providers.length;
        return provider;
    }

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
        const start = this.currentIndex;
        let attempts = 0;

        while (attempts < this.providers.length) {
            const provider = this.getNextProvider();
            try {
                if (await provider.isAvailable()) {
                    return await provider.generate(prompt, options);
                }
            } catch (e) {
                console.warn(`Provider ${provider.name} failed in load balancer:`, e);
            }
            attempts++;
        }
        throw new Error('All providers in load balancer failed');
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        const start = this.currentIndex;
        let attempts = 0;

        while (attempts < this.providers.length) {
            const provider = this.getNextProvider();
            try {
                if (await provider.isAvailable()) {
                    const stream = provider.generateStream(prompt, options);
                    for await (const chunk of stream) {
                        yield chunk;
                    }
                    return;
                }
            } catch (e) {
                console.warn(`Provider ${provider.name} failed in load balancer:`, e);
            }
            attempts++;
        }
        throw new Error('All providers in load balancer failed');
    }

    async toolCall(messages: Message[], tools: Tool[], options?: GenerateOptions): Promise<ModelResponse> {
        let attempts = 0;

        while (attempts < this.providers.length) {
            const provider = this.getNextProvider();
            try {
                if (await provider.isAvailable() && provider.toolCall) {
                    return await provider.toolCall(messages, tools, options);
                }
            } catch (e) {
                console.warn(`Provider ${provider.name} failed toolCall:`, e);
            }
            attempts++;
        }
        throw new Error('All providers in load balancer failed');
    }

    async isAvailable(): Promise<boolean> {
        for (const p of this.providers) {
            if (await p.isAvailable()) return true;
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
