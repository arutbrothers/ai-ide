import * as fs from 'fs';
import * as path from 'path';
import { registry } from './AdapterRegistry';
import { OllamaAdapter } from './adapters/OllamaAdapter';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';
import { CustomAdapter } from './adapters/CustomAdapter';

interface ProviderConfig {
    type: 'local' | 'api';
    baseURL?: string;
    apiKey?: string;
    model?: string;
    enabled?: boolean;
    [key: string]: any;
}

interface Config {
    models: {
        default: string;
        providers: Record<string, ProviderConfig>;
    };
    agentDefaults?: Record<string, string>;
}

export class ConfigManager {
    private configPath: string;

    constructor(rootPath: string = process.cwd(), configName: string = '.aiiderc.json') {
        this.configPath = path.resolve(rootPath, configName);
    }

    private substituteEnv(value: string): string {
        if (!value) return value;
        return value.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
            return process.env[envVar] || '';
        });
    }

    async load(): Promise<void> {
        if (!fs.existsSync(this.configPath)) {
            console.warn(`Config file not found at ${this.configPath}, using defaults.`);
            return;
        }

        try {
            const content = await fs.promises.readFile(this.configPath, 'utf-8');
            const config: Config = JSON.parse(content);

            // Configure providers
            for (const [id, providerConfig] of Object.entries(config.models.providers)) {
                if (providerConfig.enabled === false) continue;

                const apiKey = providerConfig.apiKey ? this.substituteEnv(providerConfig.apiKey) : undefined;
                const baseURL = providerConfig.baseURL ? this.substituteEnv(providerConfig.baseURL) : undefined;
                const model = providerConfig.model;

                switch (id) {
                    case 'ollama':
                        registry.register(id, new OllamaAdapter(baseURL, providerConfig.defaultModel || model));
                        break;
                    case 'claude':
                        if (apiKey) {
                            registry.register(id, new AnthropicAdapter(apiKey, model));
                        }
                        break;
                    case 'openai':
                        if (apiKey) {
                            registry.register(id, new OpenAIAdapter(apiKey, model));
                        }
                        break;
                    case 'custom':
                    default:
                        if (baseURL) {
                            registry.register(id, new CustomAdapter(baseURL, apiKey, model));
                        }
                        break;
                }
            }

            // Set default
            if (config.models.default) {
                try {
                    registry.setDefault(config.models.default);
                } catch (e) {
                    console.warn(`Could not set default provider to ${config.models.default}: ${(e as Error).message}`);
                }
            }

        } catch (error) {
            console.error('Failed to load configuration:', error);
        }
    }
}
