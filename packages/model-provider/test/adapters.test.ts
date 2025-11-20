import { OllamaAdapter } from '../src/adapters/OllamaAdapter';
import { AnthropicAdapter } from '../src/adapters/AnthropicAdapter';
import { OpenAIAdapter } from '../src/adapters/OpenAIAdapter';
import { CustomAdapter } from '../src/adapters/CustomAdapter';
import { registry, AdapterRegistry } from '../src/AdapterRegistry';
import { metricsCollector } from '../src/metrics';
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
            return new MockResponse(JSON.stringify({ response: 'Generated text' }));
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
        return new MockResponse(JSON.stringify({ content: [{ text: 'Claude response' }] }));
    }

    // OpenAI
    if (urlStr.includes('openai')) {
        if (urlStr.includes('models')) return new MockResponse('{}');
        const body = JSON.parse(options.body);
        if (body.stream) {
            const streamData = `data: {"choices":[{"delta":{"content":"GPT"}}]}\n\ndata: {"choices":[{"delta":{"content":" response"}}]}\n\ndata: [DONE]\n\n`;
            return new MockResponse(streamData);
        }
        return new MockResponse(JSON.stringify({ choices: [{ message: { content: 'GPT response' } }] }));
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
    assert.strictEqual(result, 'Generated text');

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
    assert.strictEqual(result, 'Claude response');

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
    assert.strictEqual(result, 'GPT response');

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
    assert.strictEqual(result, 'Custom response');
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

async function runTests() {
    try {
        await testOllama();
        await testAnthropic();
        await testOpenAI();
        await testCustom();
        await testRegistry();
        await testMetrics();
        console.log('All tests passed!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

runTests();
