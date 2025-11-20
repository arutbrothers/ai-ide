import { ModelProvider, GenerateOptions, Message, Tool, ModelResponse, ToolCall } from '../types';

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

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
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
        const textContent = data.content.find((c: any) => c.type === 'text')?.text || '';

        return {
            content: textContent,
            usage: data.usage ? {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens
            } : undefined
        };
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

    async toolCall(messages: Message[], tools: Tool[], options?: GenerateOptions): Promise<ModelResponse> {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: options?.maxTokens ?? 4096,
                messages: messages,
                tools: tools.map(t => ({
                    name: t.name,
                    description: t.description,
                    input_schema: t.parameters
                })),
                temperature: options?.temperature ?? 0.7,
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic ToolCall error: ${response.statusText}`);
        }

        const data = await response.json();

        let content = '';
        const toolCalls: ToolCall[] = [];

        for (const block of data.content) {
            if (block.type === 'text') {
                content += block.text;
            } else if (block.type === 'tool_use') {
                toolCalls.push({
                    id: block.id,
                    function: {
                        name: block.name,
                        arguments: JSON.stringify(block.input)
                    }
                });
            }
        }

        return {
            content,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            usage: data.usage ? {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens,
                totalTokens: data.usage.input_tokens + data.usage.output_tokens
            } : undefined
        };
    }

    async isAvailable(): Promise<boolean> {
        if (!this.apiKey) return false;
        try {
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
