import { ModelProvider, GenerateOptions, Message, Tool, ModelResponse } from '../types';

export class TokenRoutingAdapter implements ModelProvider {
    name = 'TokenRouting';
    type: 'local' | 'api' = 'api'; // varies
    requiresAuth = false;
    supportsStreaming = true;
    supportsTools = true;
    maxContextTokens = 128000; // Uses large provider's max usually

    constructor(
        private smallProvider: ModelProvider,
        private largeProvider: ModelProvider,
        private threshold: number = 1000 // Token threshold
    ) {
        this.supportsStreaming = smallProvider.supportsStreaming && largeProvider.supportsStreaming;
        this.supportsTools = smallProvider.supportsTools && largeProvider.supportsTools;
        this.maxContextTokens = largeProvider.maxContextTokens;
    }

    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    private getProvider(prompt: string): ModelProvider {
        const tokens = this.estimateTokens(prompt);
        return tokens > this.threshold ? this.largeProvider : this.smallProvider;
    }

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
        const provider = this.getProvider(prompt);
        try {
            return await provider.generate(prompt, options);
        } catch (e) {
            // Optional: Fallback to other provider?
            // For strict routing, we fail. For robustness, we could fallback.
            // Let's fail to be predictable.
            throw e;
        }
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        const provider = this.getProvider(prompt);
        const stream = provider.generateStream(prompt, options);
        for await (const chunk of stream) {
            yield chunk;
        }
    }

    async toolCall(messages: Message[], tools: Tool[], options?: GenerateOptions): Promise<ModelResponse> {
        // For tool calls, we sum message content length
        const totalLength = messages.reduce((acc, m) => acc + m.content.length, 0);
        const tokens = this.estimateTokens(totalLength.toString()); // Wait, reduce returns number.
        // Re-calc:
        const contentStr = messages.map(m => m.content).join('');
        const provider = this.estimateTokens(contentStr) > this.threshold ? this.largeProvider : this.smallProvider;

        if (provider.toolCall) {
            return await provider.toolCall(messages, tools, options);
        }
        throw new Error(`Selected provider ${provider.name} does not support tool calls`);
    }

    async isAvailable(): Promise<boolean> {
        return (await this.smallProvider.isAvailable()) || (await this.largeProvider.isAvailable());
    }

    async getInfo(): Promise<Record<string, any>> {
        return {
            name: this.name,
            small: await this.smallProvider.getInfo(),
            large: await this.largeProvider.getInfo(),
            threshold: this.threshold,
            type: this.type
        };
    }
}
