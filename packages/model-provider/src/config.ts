import * as fs from 'fs';
import * as path from 'path';
import { registry } from './AdapterRegistry';
import { OllamaAdapter } from './adapters/OllamaAdapter';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';
import { CustomAdapter } from './adapters/CustomAdapter';
import { SecretStore } from './types';

export interface ProviderConfig {
    type: 'local' | 'api';
    baseURL?: string;
    apiKey?: string;
    model?: string;
    enabled?: boolean;
    [key: string]: any;
}

export interface Config {
    general?: {
        approvalThreshold?: number;
        autoVerification?: boolean;
    };
    models: {
        default: string;
        providers: Record<string, ProviderConfig>;
    };
    agentDefaults?: Record<string, string>;
}

export class ConfigManager {
    private configPath: string;
    private secretStore?: SecretStore;
    private currentConfig: Config | null = null;

    constructor(rootPath: string = process.cwd(), configName: string = '.aiiderc.json', secretStore?: SecretStore) {
        this.configPath = path.resolve(rootPath, configName);
        this.secretStore = secretStore;
    }

    getConfig(): Config | null {
        return this.currentConfig;
    }

    private async resolveValue(value: string): Promise<string> {
        if (!value) return value;

        // Handle Env Vars
        if (value.match(/\$\{([^}]+)\}/)) {
             return value.replace(/\$\{([^}]+)\}/g, (_, envVar) => {
                return process.env[envVar] || '';
            });
        }

        // Handle Secrets
        if (value.startsWith('secret:') && this.secretStore) {
            const key = value.slice(7);
            const secret = await this.secretStore.get(key);
            return secret || '';
        }

        return value;
    }

    async load(): Promise<void> {
        if (!fs.existsSync(this.configPath)) {
            console.warn(`Config file not found at ${this.configPath}, using defaults.`);
            return;
        }

        try {
            const content = await fs.promises.readFile(this.configPath, 'utf-8');
            const config: Config = JSON.parse(content);
            this.currentConfig = config;

            // Configure providers
            for (const [id, providerConfig] of Object.entries(config.models.providers)) {
                if (providerConfig.enabled === false) continue;

                const apiKey = providerConfig.apiKey ? await this.resolveValue(providerConfig.apiKey) : undefined;
                const baseURL = providerConfig.baseURL ? await this.resolveValue(providerConfig.baseURL) : undefined;
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

    async save(config: Config): Promise<void> {
        try {
            await fs.promises.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
            // Reload to apply changes
            await this.load();
        } catch (error) {
            console.error('Failed to save configuration:', error);
            throw error;
        }
    }

    async exportSettings(destPath: string): Promise<void> {
        try {
            if (fs.existsSync(this.configPath)) {
                await fs.promises.copyFile(this.configPath, destPath);
            }
        } catch (error) {
             console.error('Failed to export settings:', error);
             throw error;
        }
    }

    async importSettings(srcPath: string): Promise<void> {
        try {
             await fs.promises.copyFile(srcPath, this.configPath);
             await this.load();
        } catch (error) {
             console.error('Failed to import settings:', error);
             throw error;
        }
    }
}
