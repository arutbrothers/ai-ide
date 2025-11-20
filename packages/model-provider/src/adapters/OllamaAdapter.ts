import { ModelProvider, GenerateOptions, Message, Tool } from '../types';

export class OllamaAdapter implements ModelProvider {
    name = 'Ollama';
    type: 'local' | 'api' = 'local';
    requiresAuth = false;
    supportsStreaming = true;
    supportsTools = false; // Ollama tool support varies, defaulting to false for now
    maxContextTokens = 4096;

    constructor(
        private baseURL: string = 'http://localhost:11434',
        private model: string = 'codellama:7b'
    ) {}

    async generate(prompt: string, options: GenerateOptions): Promise<string> {
        const response = await fetch(`${this.baseURL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt,
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

        const data = await response.json();
        return data.response;
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
            // Keep the last line in buffer if it's potentially incomplete
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;

                try {
                    const data = JSON.parse(trimmed);
                    if (data.response) {
                        yield data.response;
                    }
                    if (data.done) {
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing JSON line:', trimmed, e);
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
                console.error('Error parsing JSON line:', buffer, e);
            }
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

    async listModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseURL}/api/tags`);
            const data = await response.json();
            return data.models.map((m: any) => m.name);
        } catch {
            return [];
        }
    }
}
