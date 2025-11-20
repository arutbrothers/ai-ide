export interface GenerateOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stop?: string[];
    systemPrompt?: string;
}

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface Tool {
    name: string;
    description: string;
    parameters: any; // JSON Schema
}

export interface ModelProvider {
    // Basic info
    name: string; // "Ollama", "Anthropic", "OpenAI", "Custom"
    type: 'local' | 'api'; // Local = no internet, API = cloud
    requiresAuth: boolean; // false for Ollama, true for cloud APIs

    // Capabilities
    supportsStreaming: boolean;
    supportsTools: boolean;
    maxContextTokens: number;

    // Core methods
    generate(prompt: string, options: GenerateOptions): Promise<string>;
    generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string>;
    isAvailable(): Promise<boolean>;
    getInfo(): Promise<Record<string, any>>;

    // Tool calling (optional)
    toolCall?(messages: Message[], tools: Tool[]): Promise<any>;
}

export interface ModelProviderInfo {
    id: string;
    name: string;
    type: 'local' | 'api';
    requiresAuth: boolean;
    available: boolean;
}
