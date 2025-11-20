import { ModelProvider, GenerateOptions, Message, Tool, ModelResponse } from '../types';

export class OpenAIAdapter implements ModelProvider {
    name = 'OpenAI';
    type: 'local' | 'api' = 'api';
    requiresAuth = true;
    supportsStreaming = true;
    supportsTools = true;
    maxContextTokens = 128000; // GPT-4o

    constructor(
        private apiKey: string,
        private model: string = 'gpt-4o'
    ) {}

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
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
            throw new Error(`OpenAI API error: ${response.status} ${error}`);
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
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
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
            throw new Error(`OpenAI API error: ${response.status} ${error}`);
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
                        // Ignore parse errors
                    }
                }
            }
        }
    }

    async toolCall(messages: Message[], tools: Tool[], options?: GenerateOptions): Promise<ModelResponse> {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
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
            const error = await response.text();
            throw new Error(`OpenAI ToolCall error: ${response.status} ${error}`);
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
        if (!this.apiKey) return false;
        try {
            await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
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
