import { OllamaAdapter } from '../src/adapters/OllamaAdapter';
import { AnthropicAdapter } from '../src/adapters/AnthropicAdapter';
import { OpenAIAdapter } from '../src/adapters/OpenAIAdapter';
import { CustomAdapter } from '../src/adapters/CustomAdapter';
import { registry, AdapterRegistry } from '../src/AdapterRegistry';
import { metricsCollector } from '../src/metrics';
import { FallbackAdapter } from '../src/strategies/Fallback';
import { CommitteeAdapter } from '../src/strategies/Committee';
import { LoadBalancerAdapter } from '../src/strategies/LoadBalancer';
import { TokenRoutingAdapter } from '../src/strategies/TokenRoutingAdapter';
import { HuggingFaceAdapter } from '../src/adapters/HuggingFaceAdapter';
import * as assert from 'assert';

// Mock global fetch
const originalFetch = global.fetch;

// Simple mock response
class MockResponse {
    constructor(private bodyText: string, private status: number = 200) {}

    get ok() { return this.status >= 200 && this.status < 300; }
    get statusText() { return 'OK'; }

    async json() {
        return JSON.parse(this.bodyText);
    }

    async text() {
        return this.bodyText;
    }

    get body() {
        const text = this.bodyText;
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(text));
                controller.close();
            }
        });
        return stream;
    }
}

async function mockFetch(url: string | Request, options: any) {
    const urlStr = url.toString();

    // Ollama
    if (urlStr.includes('ollama') || urlStr.includes('11434')) {
        if (urlStr.endsWith('/api/tags')) {
            return new MockResponse(JSON.stringify({ models: [{ name: 'codellama:7b' }] }));
        }
        if (urlStr.endsWith('/api/generate')) {
            const body = JSON.parse(options.body);
            if (body.stream) {
                // Mock stream response for Ollama
                return new MockResponse(JSON.stringify({ response: 'Hello', done: false }) + '\n' + JSON.stringify({ response: ' World', done: true }));
            }
            return new MockResponse(JSON.stringify({ response: 'Generated text', prompt_eval_count: 10, eval_count: 20 }));
        }
        if (urlStr.endsWith('/api/chat')) {
             return new MockResponse(JSON.stringify({ message: { content: '', tool_calls: [{ function: { name: 'test_tool', arguments: {} } }] }, prompt_eval_count: 5, eval_count: 5 }));
        }
        if (urlStr.endsWith('/api/pull') || urlStr.endsWith('/api/delete')) {
            return new MockResponse('{}');
        }
    }

    // Anthropic
    if (urlStr.includes('anthropic')) {
        if (urlStr.includes('ping')) return new MockResponse('{}');
        const body = JSON.parse(options.body);
        if (body.stream) {
            // SSE format
            const streamData = `event: message_start\ndata: {}\n\nevent: content_block_delta\ndata: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Claude"}}\n\nevent: content_block_delta\ndata: {"type": "content_block_delta", "index": 1, "delta": {"type": "text_delta", "text": " says hi"}}\n\nevent: message_stop\ndata: {"type": "message_stop"}\n\n`;
            return new MockResponse(streamData);
        }
        // Tool call check (mock response with tool use)
        if (body.tools) {
             return new MockResponse(JSON.stringify({
                 content: [{ type: 'tool_use', id: 'tool_1', name: 'test_tool', input: {} }],
                 usage: { input_tokens: 10, output_tokens: 10 }
             }));
        }
        return new MockResponse(JSON.stringify({
            content: [{ text: 'Claude response', type: 'text' }],
            usage: { input_tokens: 5, output_tokens: 10 }
        }));
    }

    // OpenAI
    if (urlStr.includes('openai')) {
        if (urlStr.includes('models')) return new MockResponse('{}');
        const body = JSON.parse(options.body);
        if (body.stream) {
            const streamData = `data: {"choices":[{"delta":{"content":"GPT"}}]}\n\ndata: {"choices":[{"delta":{"content":" response"}}]}\n\ndata: [DONE]\n\n`;
            return new MockResponse(streamData);
        }
        if (body.tools) {
             return new MockResponse(JSON.stringify({
                 choices: [{ message: { content: null, tool_calls: [{ id: 'call_1', function: { name: 'test_tool', arguments: '{}' } }] } }],
                 usage: { prompt_tokens: 10, completion_tokens: 10, total_tokens: 20 }
             }));
        }
        return new MockResponse(JSON.stringify({
            choices: [{ message: { content: 'GPT response' } }],
            usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
        }));
    }

    // Custom
    if (urlStr.includes('custom')) {
         if (urlStr.includes('models')) return new MockResponse('{}');
         return new MockResponse(JSON.stringify({ choices: [{ message: { content: 'Custom response' } }] }));
    }

    return new MockResponse('{}', 404);
}

// @ts-ignore
global.fetch = mockFetch;

async function testOllama() {
    console.log('Testing Ollama...');
    const adapter = new OllamaAdapter();
    const result = await adapter.generate('test', {});
    assert.strictEqual(result.content, 'Generated text');
    assert.strictEqual(result.usage?.totalTokens, 30);

    // Test Tool Call
    const toolResult = await adapter.toolCall!([], [{name: 'test_tool', description: 'test', parameters: {}}]);
    assert.ok(toolResult.toolCalls);
    assert.strictEqual(toolResult.toolCalls[0].function.name, 'test_tool');

    const stream = adapter.generateStream('test', {});
    let streamed = '';
    for await (const chunk of stream) {
        streamed += chunk;
    }
    assert.strictEqual(streamed, 'Hello World');
    console.log('Ollama passed');
}

async function testAnthropic() {
    console.log('Testing Anthropic...');
    const adapter = new AnthropicAdapter('fake-key');
    const result = await adapter.generate('test', {});
    assert.strictEqual(result.content, 'Claude response');
    assert.strictEqual(result.usage?.totalTokens, 15);

    // Test Tool Call
    const toolResult = await adapter.toolCall!([], [{name: 'test_tool', description: 'test', parameters: {}}]);
    assert.ok(toolResult.toolCalls);
    assert.strictEqual(toolResult.toolCalls[0].function.name, 'test_tool');

    const stream = adapter.generateStream('test', {});
    let streamed = '';
    for await (const chunk of stream) {
        streamed += chunk;
    }
    assert.strictEqual(streamed, 'Claude says hi');
    console.log('Anthropic passed');
}

async function testOpenAI() {
    console.log('Testing OpenAI...');
    const adapter = new OpenAIAdapter('fake-key');
    const result = await adapter.generate('test', {});
    assert.strictEqual(result.content, 'GPT response');
    assert.strictEqual(result.usage?.totalTokens, 10);

    // Test Tool Call
    const toolResult = await adapter.toolCall!([], [{name: 'test_tool', description: 'test', parameters: {}}]);
    assert.ok(toolResult.toolCalls);
    assert.strictEqual(toolResult.toolCalls[0].function.name, 'test_tool');

    const stream = adapter.generateStream('test', {});
    let streamed = '';
    for await (const chunk of stream) {
        streamed += chunk;
    }
    assert.strictEqual(streamed, 'GPT response');
    console.log('OpenAI passed');
}

async function testCustom() {
    console.log('Testing Custom...');
    const adapter = new CustomAdapter('http://custom-api:8080');
    const result = await adapter.generate('test', {});
    assert.strictEqual(result.content, 'Custom response');
    console.log('Custom passed');
}

async function testRegistry() {
    console.log('Testing Registry...');
    const reg = new AdapterRegistry();
    const list = await reg.list();
    assert.ok(list.find(a => a.id === 'ollama'));

    const ollama = reg.get('ollama');
    assert.ok(ollama);
    assert.strictEqual(ollama?.name, 'Ollama');
    console.log('Registry passed');
}

async function testMetrics() {
    console.log('Testing Metrics...');
    await metricsCollector.track('ollama', 'codellama', 100, 500, true);
    const metrics = await metricsCollector.getMetrics();
    assert.strictEqual(metrics.length, 1);
    assert.strictEqual(metrics[0].provider, 'ollama');
    assert.strictEqual(metrics[0].totalRequests, 1);
    console.log('Metrics passed');
}

class MockProvider {
    name = 'Mock';
    type = 'local' as const;
    requiresAuth = false;
    supportsStreaming = false;
    supportsTools = false;
    maxContextTokens = 1000;

    constructor(private id: string, private shouldFail: boolean = false, private output: string = 'mock') {}

    async generate() {
        if (this.shouldFail) throw new Error('Fail');
        return { content: this.output };
    }
    async *generateStream() { yield this.output; }
    async isAvailable() { return true; }
    async getInfo() { return { name: this.name, id: this.id }; }
}

async function testFallback() {
    console.log('Testing Fallback...');
    const p1 = new MockProvider('p1', true); // Fails
    const p2 = new MockProvider('p2', false, 'Success');

    const fallback = new FallbackAdapter([p1, p2]);
    const result = await fallback.generate('prompt', {});
    assert.strictEqual(result.content, 'Success');
    console.log('Fallback passed');
}

async function testCommittee() {
    console.log('Testing Committee...');
    const p1 = new MockProvider('p1', false, 'Result A');
    const p2 = new MockProvider('p2', false, 'Result B');

    const committee = new CommitteeAdapter([p1, p2]);
    const result = await committee.generate('prompt', {});
    const json = JSON.parse(result.content);

    assert.strictEqual(json.committee, true);
    assert.strictEqual(json.results.length, 2);
    assert.strictEqual(json.results[0].content, 'Result A');
    assert.strictEqual(json.results[1].content, 'Result B');
    console.log('Committee passed');
}

async function testLoadBalancer() {
    console.log('Testing LoadBalancer...');
    const p1 = new MockProvider('p1', false, 'Result A');
    const p2 = new MockProvider('p2', false, 'Result B');

    const lb = new LoadBalancerAdapter([p1, p2]);

    // First call: p1
    let result = await lb.generate('prompt', {});
    assert.strictEqual(result.content, 'Result A');

    // Second call: p2
    result = await lb.generate('prompt', {});
    assert.strictEqual(result.content, 'Result B');

    // Third call: p1
    result = await lb.generate('prompt', {});
    assert.strictEqual(result.content, 'Result A');

    console.log('LoadBalancer passed');
}

async function testHuggingFace() {
    console.log('Testing HuggingFace...');
    const hf = new HuggingFaceAdapter();
    // Check availability only to avoid downloading model
    const available = await hf.isAvailable();
    assert.strictEqual(available, true);
    console.log('HuggingFace passed');
}

async function testTokenRouting() {
    console.log('Testing TokenRouting...');
    const small = new MockProvider('small', false, 'Small Response');
    const large = new MockProvider('large', false, 'Large Response');

    // Threshold 10 chars approx (10/4 = 2.5 tokens) -> let's use characters for estimation check
    // estimateTokens = ceil(len/4).
    // Threshold = 2.
    // "Short" (5 chars) -> 2 tokens <= 2? No, 5/4 = 1.25 -> ceil -> 2.
    // "Longer" (20 chars) -> 5 tokens > 2.

    const router = new TokenRoutingAdapter(small, large, 2);

    // Short prompt (len 4) -> 1 token <= 2 -> Small
    let result = await router.generate('1234', {});
    assert.strictEqual(result.content, 'Small Response');

    // Long prompt (len 12) -> 3 tokens > 2 -> Large
    result = await router.generate('123456789012', {});
    assert.strictEqual(result.content, 'Large Response');

    console.log('TokenRouting passed');
}

async function runTests() {
    try {
        await testOllama();
        await testAnthropic();
        await testOpenAI();
        await testCustom();
        await testRegistry();
        await testMetrics();
        await testFallback();
        await testCommittee();
        await testLoadBalancer();
        await testTokenRouting();
        await testHuggingFace();
        console.log('All tests passed!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

runTests();
