import { ModelProvider, GenerateOptions, Message, Tool } from '../types';

export class AnthropicAdapter implements ModelProvider {
    name = 'Anthropic';
    type: 'local' | 'api' = 'api';
    requiresAuth = true;
    supportsStreaming = true;
    supportsTools = true;
    maxContextTokens = 200000; // Claude 3 Sonnet/Opus has 200k context

    constructor(
        private apiKey: string,
        private model: string = 'claude-3-sonnet-20240229'
    ) {}

    async generate(prompt: string, options: GenerateOptions): Promise<string> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: options.maxTokens ?? 4096,
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature ?? 0.7,
                system: options.systemPrompt,
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: options.maxTokens ?? 4096,
                messages: [{ role: 'user', content: prompt }],
                temperature: options.temperature ?? 0.7,
                stream: true,
                system: options.systemPrompt,
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6);
                    if (dataStr === '[DONE]') continue;

                    try {
                        const data = JSON.parse(dataStr);
                        if (data.type === 'content_block_delta' && data.delta?.text) {
                            yield data.delta.text;
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }
    }

    async isAvailable(): Promise<boolean> {
        // Check if API key is valid by making a small request or just assume true if key exists
        if (!this.apiKey) return false;
        try {
            // Minimal request to check auth
            await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 1,
                    messages: [{ role: 'user', content: 'ping' }],
                })
            });
            return true;
        } catch {
            return false;
        }
    }

    async getInfo(): Promise<Record<string, any>> {
        return {
            name: this.name,
            model: this.model,
            type: this.type
        };
    }
}
