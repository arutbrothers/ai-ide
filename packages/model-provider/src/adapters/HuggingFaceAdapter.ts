import { ModelProvider, GenerateOptions, Message, Tool, ModelResponse } from '../types';

export class HuggingFaceAdapter implements ModelProvider {
    name = 'HuggingFace';
    type: 'local' | 'api' = 'local';
    requiresAuth = false;
    supportsStreaming = true;
    supportsTools = false;
    maxContextTokens = 2048; // Varies by model

    private generator: any = null;
    private loading = false;

    constructor(
        private model: string = 'Xenova/codegen-350M-mono',
        private task: string = 'text-generation'
    ) {}

    private async initialize() {
        if (this.generator) return;
        if (this.loading) {
            while (this.loading) {
                await new Promise(r => setTimeout(r, 100));
                if (this.generator) return;
            }
        }

        this.loading = true;
        try {
            const { pipeline } = await import('@xenova/transformers');
            this.generator = await pipeline(this.task as any, this.model);
        } finally {
            this.loading = false;
        }
    }

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
        await this.initialize();

        const output = await this.generator(prompt, {
            max_new_tokens: options.maxTokens ?? 128,
            temperature: options.temperature ?? 0.7,
            top_p: options.topP ?? 0.9,
            // Don't use streamer here
        });

        // Output format depends on task. For text-generation it's array of { generated_text: string }
        const text = output[0]?.generated_text || '';
        // Remove prompt if included (default behavior of some models)
        const content = text.startsWith(prompt) ? text.slice(prompt.length) : text;

        return {
            content,
            usage: {
                promptTokens: prompt.length / 4, // Rough estimate
                completionTokens: content.length / 4,
                totalTokens: (prompt.length + content.length) / 4
            }
        };
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        await this.initialize();

        // @ts-ignore
        const { TextStreamer } = await import('@xenova/transformers');

        let streamBuffer = '';
        const streamer = new TextStreamer(this.generator.tokenizer, {
            skip_prompt: true,
            callback_function: (text: string) => {
                streamBuffer += text;
            }
        });

        // Run generator in background (it returns promise but we want to yield chunks)
        // Transformers.js streamer callback is sync?
        // Actually TextStreamer prints to stdout by default if no callback?
        // Wait, TextStreamer usage in pipeline:

        // We need a custom streamer to yield.
        // Since generator is async, we can't easily yield from within the callback if we await the generator.
        // We need a queue.

        const queue: string[] = [];
        let done = false;
        let error: any = null;

        const customStreamer = {
            put: (chunk: any) => {
                const text = this.generator.tokenizer.decode(chunk, { skip_special_tokens: true });
                if (text) queue.push(text);
            },
            end: () => {
                done = true;
            }
        };

        // Start generation
        this.generator(prompt, {
            max_new_tokens: options.maxTokens ?? 128,
            temperature: options.temperature ?? 0.7,
            top_p: options.topP ?? 0.9,
            streamer: customStreamer,
        }).catch((err: any) => {
            error = err;
            done = true;
        }).then(() => {
            done = true;
        });

        while (!done || queue.length > 0) {
            if (error) throw error;

            if (queue.length > 0) {
                const chunk = queue.shift();
                if (chunk) yield chunk;
            } else {
                await new Promise(r => setTimeout(r, 10));
            }
        }
    }

    async isAvailable(): Promise<boolean> {
        return true; // Local library
    }

    async getInfo(): Promise<Record<string, any>> {
        return {
            name: this.name,
            model: this.model,
            type: this.type
        };
    }
}
