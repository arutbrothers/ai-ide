import { ModelProvider, ModelProviderInfo } from './types';
import { OllamaAdapter } from './adapters/OllamaAdapter';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';

export class AdapterRegistry {
    private adapters: Map<string, ModelProvider> = new Map();
    private defaultAdapter: string = 'ollama';

    constructor() {
        // Initialize default adapters
        // Note: In a real app, these would be configured via settings, not hardcoded empty keys
        // We register them, but they might not be 'available' until configured.

        this.register('ollama', new OllamaAdapter());

        if (process.env.ANTHROPIC_API_KEY) {
            this.register('claude', new AnthropicAdapter(process.env.ANTHROPIC_API_KEY));
        }

        if (process.env.OPENAI_API_KEY) {
            this.register('openai', new OpenAIAdapter(process.env.OPENAI_API_KEY));
        }
    }

    register(id: string, adapter: ModelProvider): void {
        this.adapters.set(id, adapter);
    }

    get(id: string): ModelProvider | undefined {
        return this.adapters.get(id);
    }

    async list(): Promise<ModelProviderInfo[]> {
        const infos: ModelProviderInfo[] = [];

        for (const [id, adapter] of this.adapters.entries()) {
            infos.push({
                id,
                name: adapter.name,
                type: adapter.type,
                requiresAuth: adapter.requiresAuth,
                available: await adapter.isAvailable(),
            });
        }

        return infos;
    }

    setDefault(id: string): void {
        if (!this.adapters.has(id)) {
            throw new Error(`Adapter ${id} not registered`);
        }
        this.defaultAdapter = id;
    }

    getDefault(): ModelProvider {
        const adapter = this.adapters.get(this.defaultAdapter);
        if (!adapter) {
            // Fallback to ollama if default is missing
            const ollama = this.adapters.get('ollama');
            if (ollama) return ollama;
            throw new Error('No default adapter configured');
        }
        return adapter;
    }
}

export const registry = new AdapterRegistry();
