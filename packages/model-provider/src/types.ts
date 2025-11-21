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
    generate(prompt: string, options: GenerateOptions): Promise<ModelResponse>;
    generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string>;
    isAvailable(): Promise<boolean>;
    getInfo(): Promise<Record<string, any>>;

    // Tool calling
    toolCall?(messages: Message[], tools: Tool[], options?: GenerateOptions): Promise<ModelResponse>;

    // Model Management (Optional)
    listModels?(): Promise<string[]>;
    pullModel?(model: string): Promise<void>;
    deleteModel?(model: string): Promise<void>;
}

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface ModelResponse {
    content: string; // or null if tool call?
    toolCalls?: ToolCall[];
    usage?: TokenUsage;
}

export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string; // JSON string
    };
}

export interface ModelProviderInfo {
    id: string;
    name: string;
    type: 'local' | 'api';
    requiresAuth: boolean;
    available: boolean;
}

export interface SecretStore {
    store(key: string, value: string): Promise<void>;
    get(key: string): Promise<string | undefined>;
    delete(key: string): Promise<void>;
}
