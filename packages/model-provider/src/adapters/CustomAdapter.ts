import { ModelProvider, GenerateOptions, Message, Tool, ModelResponse } from '../types';

export class CustomAdapter implements ModelProvider {
    name = 'Custom';
    type: 'local' | 'api';
    requiresAuth: boolean;
    supportsStreaming = true;
    supportsTools = true; // Assuming OpenAI-compatible
    maxContextTokens = 4096; // Conservative default

    constructor(
        private baseURL: string,
        private apiKey?: string,
        private model: string = 'default'
    ) {
        this.requiresAuth = !!apiKey;
        this.type = baseURL.includes('localhost') || baseURL.includes('127.0.0.1') ? 'local' : 'api';
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['Authorization'] = `Bearer ${this.apiKey}`;
        }
        return headers;
    }

    private getEndpoint(path: string): string {
        const base = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        return `${base}/v1${path}`;
    }

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
        const response = await fetch(this.getEndpoint('/chat/completions'), {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                model: this.model,
                messages: [
                    ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens,
                top_p: options.topP,
                stop: options.stop,
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Custom API error: ${response.status} ${error}`);
        }

        const data = await response.json();
        return {
            content: data.choices[0].message.content,
            usage: data.usage ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            } : undefined
        };
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        const response = await fetch(this.getEndpoint('/chat/completions'), {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                model: this.model,
                messages: [
                    ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: options.temperature ?? 0.7,
                max_tokens: options.maxTokens,
                top_p: options.topP,
                stop: options.stop,
                stream: true,
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Custom API error: ${response.status} ${error}`);
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
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                    const dataStr = trimmed.slice(6);
                    if (dataStr === '[DONE]') continue;

                    try {
                        const data = JSON.parse(dataStr);
                        const content = data.choices[0]?.delta?.content;
                        if (content) {
                            yield content;
                        }
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }
    }

    async toolCall(messages: Message[], tools: Tool[], options?: GenerateOptions): Promise<ModelResponse> {
        const response = await fetch(this.getEndpoint('/chat/completions'), {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                model: this.model,
                messages: messages,
                tools: tools.map(t => ({
                    type: 'function',
                    function: {
                        name: t.name,
                        description: t.description,
                        parameters: t.parameters
                    }
                })),
                temperature: options?.temperature ?? 0.7,
            })
        });

        if (!response.ok) {
            throw new Error(`Custom ToolCall error: ${response.statusText}`);
        }

        const data = await response.json();
        const msg = data.choices[0].message;

        return {
            content: msg.content || '',
            toolCalls: msg.tool_calls ? msg.tool_calls.map((tc: any) => ({
                id: tc.id,
                function: {
                    name: tc.function.name,
                    arguments: tc.function.arguments
                }
            })) : undefined,
            usage: data.usage ? {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens,
                totalTokens: data.usage.total_tokens
            } : undefined
        };
    }

    async isAvailable(): Promise<boolean> {
        try {
            // Try models endpoint
            const response = await fetch(this.getEndpoint('/models'), {
                headers: this.getHeaders()
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async getInfo(): Promise<Record<string, any>> {
        return {
            name: this.name,
            model: this.model,
            baseURL: this.baseURL,
            type: this.type
        };
    }
}
