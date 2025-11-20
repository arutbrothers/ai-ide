import { ModelProvider, GenerateOptions, Message, Tool, ModelResponse } from '../types';

export class OllamaAdapter implements ModelProvider {
    name = 'Ollama';
    type: 'local' | 'api' = 'local';
    requiresAuth = false;
    supportsStreaming = true;
    supportsTools = true;
    maxContextTokens = 4096;

    constructor(
        private baseURL: string = 'http://localhost:11434',
        private model: string = 'codellama:7b'
    ) {
        try {
            const url = new URL(baseURL);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new Error('Invalid protocol');
            }
        } catch (e) {
            throw new Error(`Invalid Ollama URL: ${baseURL}`);
        }
    }

    async generate(prompt: string, options: GenerateOptions): Promise<ModelResponse> {
        const response = await fetch(`${this.baseURL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt,
                temperature: options.temperature ?? 0.7,
                stream: false,
                options: {
                    num_predict: options.maxTokens ?? 2000,
                    stop: options.stop,
                    top_p: options.topP,
                },
                system: options.systemPrompt
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
            content: data.response,
            usage: {
                promptTokens: data.prompt_eval_count || 0,
                completionTokens: data.eval_count || 0,
                totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
            }
        };
    }

    async *generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string> {
        const response = await fetch(`${this.baseURL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt,
                stream: true,
                temperature: options.temperature ?? 0.7,
                options: {
                    num_predict: options.maxTokens ?? 2000,
                    stop: options.stop,
                    top_p: options.topP,
                },
                system: options.systemPrompt
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
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
                if (!trimmed) continue;

                try {
                    const data = JSON.parse(trimmed);
                    if (data.response) {
                        yield data.response;
                    }
                } catch (e) {
                    // ignore
                }
            }
        }

        // Process any remaining buffer
        if (buffer.trim()) {
            try {
                const data = JSON.parse(buffer.trim());
                if (data.response) {
                    yield data.response;
                }
            } catch (e) {
                // ignore
            }
        }
    }

    async toolCall(messages: Message[], tools: Tool[], options?: GenerateOptions): Promise<ModelResponse> {
        const response = await fetch(`${this.baseURL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                stream: false,
                options: {
                    temperature: options?.temperature ?? 0.7,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama ToolCall error: ${response.statusText}`);
        }

        const data = await response.json();
        const msg = data.message;

        return {
            content: msg.content || '',
            toolCalls: msg.tool_calls ? msg.tool_calls.map((tc: any) => ({
                id: 'call_' + Math.random().toString(36).substr(2, 9), // Ollama might not return ID
                function: {
                    name: tc.function.name,
                    arguments: JSON.stringify(tc.function.arguments)
                }
            })) : undefined,
            usage: {
                promptTokens: data.prompt_eval_count || 0,
                completionTokens: data.eval_count || 0,
                totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
            }
        };
    }

    async listModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/tags`);
            const data = await response.json();
            return data.models.map((m: any) => m.name);
        } catch {
            return [];
        }
    }

    async pullModel(model: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model, stream: false })
        });

        if (!response.ok) {
            throw new Error(`Failed to pull model ${model}`);
        }
    }

    async deleteModel(model: string): Promise<void> {
        const response = await fetch(`${this.baseURL}/api/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model })
        });

        if (!response.ok) {
            throw new Error(`Failed to delete model ${model}`);
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseURL}/api/tags`);
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
