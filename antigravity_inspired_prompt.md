# ANTIGRAVITY-INSPIRED AI IDE - COMPLETE BUILD SPECIFICATION

## EXECUTIVE VISION

Build a **VSCode fork** that matches Google Antigravity's revolutionary agent-first development experience. This is the definitive specification for creating a production-grade, offline-first IDE that enables developers to work at a task-oriented level rather than line-by-line coding.

**Core Philosophy (Antigravity's 4 Pillars):**

1. **TRUST** - Transparent verification through artifacts
2. **AUTONOMY** - Agents work independently across surfaces
3. **FEEDBACK** - Intuitive, async, Google Docs-style comments
4. **SELF-IMPROVEMENT** - Knowledge base learns from past work

---

## PART 1: ANTIGRAVITY'S UNIQUE INNOVATIONS

### What Makes Antigravity Different from Cursor/Windsurf

**1. Agent-First Manager Surface**

- NOT just a sidebar chat
- Full "Mission Control" view for managing agents
- Agents are primary actors, surfaces (editor/terminal/browser) are their tools
- Manage multiple agents simultaneously across workspaces

**2. Artifact-Based Verification**

- Agents produce structured deliverables, not raw tool calls
- Task lists, implementation plans, walkthroughs, screenshots, recordings
- Easy to verify without technical minutiae
- Google Docs-style commenting on artifacts

**3. Asynchronous Operation**

- Agents work in background while you do other things
- No blocking UI - continue coding while agent researches
- Parallel agent execution (multiple agents, multiple tasks)

**4. Browser Control Integration**

- Integrated Chrome browser IN the IDE
- Agent can test, screenshot, record interactions
- Verification through actual browser testing
- Walkthrough recordings as artifacts

**5. Knowledge Base System**

- Agents learn from past successful work
- Store code snippets, task lists, patterns
- Retrieve and reuse knowledge in future tasks
- Self-improving over time

**6. Multi-Model Support**

- Choose between Gemini 3, Claude Sonnet 4.5, GPT-OSS
- Switch models per agent or task
- No vendor lock-in

---

## PART 2: DETAILED ARCHITECTURE

### 2.1 THREE MAIN SURFACES

Antigravity has 3 distinct surfaces that agents can control:

#### **Surface 1: Agent Manager (Mission Control)**

```
┌─────────────────────────────────────────────────────────┐
│  AGENT MANAGER - Mission Control                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Active Agents                                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🤖 Agent: Flight Tracker Feature                   │ │
│  │    Status: Executing                               │ │
│  │    Progress: 3/5 steps complete                    │ │
│  │    ├─ ✓ Research aviation APIs                    │ │
│  │    ├─ ✓ Scaffold Next.js project                  │ │
│  │    ├─ ⏳ Implement UI components                   │ │
│  │    ├─ ⏸️  Run tests                                │ │
│  │    └─ ⏸️  Browser verification                     │ │
│  │                                                    │ │
│  │    Artifacts (3):                                  │ │
│  │    📄 Implementation Plan                          │ │
│  │    📸 UI Screenshot                                │ │
│  │    🎥 Walkthrough Recording                        │ │
│  │                                                    │ │
│  │    [Pause] [Comment] [View Details]               │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🤖 Agent: API Documentation                        │ │
│  │    Status: Researching (Background)                │ │
│  │    Progress: 1/3 steps complete                    │ │
│  │    ├─ ⏳ Analyzing codebase                        │ │
│  │    ├─ ⏸️  Generate docs                            │ │
│  │    └─ ⏸️  Create examples                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [+ New Agent]  [View All Artifacts]  [Settings]       │
└─────────────────────────────────────────────────────────┘
```

**Key Features:**

- Card-based UI for each agent
- Real-time progress updates
- Collapsible task lists
- Artifact previews with thumbnails
- Ability to spawn multiple agents
- Switch between Manager and Editor view (CMD+Shift+M)

**Implementation Requirements:**

- React component with WebSocket for real-time updates
- Agent cards show status, progress, artifacts
- Click artifact to open detail view
- Click agent to see full plan
- Drag-and-drop to reorder priorities
- Filter by status (active/paused/completed)

---

#### **Surface 2: Editor View (Enhanced VSCode)**

```
┌─────────────────────────────────────────────────────────┐
│  File Explorer  │  Editor                    │ Agent    │
│                 │                            │ Panel    │
│  ├─ src/        │  ┌──────────────────────┐ │          │
│  │  ├─ app/     │  │ app.tsx              │ │ 🤖 Agent │
│  │  └─ comps/   │  ├──────────────────────┤ │ Status   │
│  ├─ public/     │  │                      │ │          │
│  └─ tests/      │  │ function App() {     │ │ Working  │
│                 │  │   return (           │ │ on:      │
│                 │  │     <FlightSearch /> │ │ • UI comp│
│                 │  │   )                  │ │          │
│                 │  │ }                    │ │ Artifacts│
│                 │  │                      │ │ 📄 Plan  │
│                 │  │ // Agent comment:    │ │ 📸 Screen│
│                 │  │ // Added error       │ │          │
│                 │  │ // handling here     │ │ [Details]│
│                 │  └──────────────────────┘ │          │
│                 │                            │          │
│                 ├────────────────────────────┴──────────┤
│                 │  Terminal                              │
│                 │  > npm run dev                         │
│                 │  ✓ Compiled successfully               │
│                 │  > Agent executed: npm test            │
│                 └────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

**Enhanced Features Beyond VSCode:**

1. **Tab Autocompletion** - Multi-line, context-aware suggestions
2. **Natural Language Commands** - Type `// add error handling` → agent implements
3. **Supercomplete** - Agent predicts next logical change, highlight + tab to accept
4. **Tab to Jump** - Jump cursor to next edit location
5. **Agent Comments** - Inline explanations of what agent did and why
6. **Live Diff Preview** - See changes before accepting

**Implementation Requirements:**

- Fork VSCode, keep Monaco editor
- Add agent sidebar panel
- Integrate inline completion provider
- Add command parser for natural language
- Show agent-made changes with highlighting
- Comment system tied to specific lines

---

#### **Surface 3: Integrated Browser (Verification)**

```
┌─────────────────────────────────────────────────────────┐
│  🌐 Chrome Browser (Agent-Controlled)                   │
├─────────────────────────────────────────────────────────┤
│  URL: http://localhost:3000                             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │         Flight Tracker App                      │   │
│  │  ┌────────────────────────────────────────┐     │   │
│  │  │ Enter Flight Number: UA1234            │     │   │
│  │  │                            [Search]     │     │   │
│  │  └────────────────────────────────────────┘     │   │
│  │                                                  │   │
│  │  Results:                                        │   │
│  │  ✈️  UA1234                                     │   │
│  │  SFO → JFK                                      │   │
│  │  Depart: 10:00 AM PST                           │   │
│  │  Arrive: 6:30 PM EST                            │   │
│  │                                                  │   │
│  │  🟢 Agent testing: Form validation              │   │
│  │  🔴 Recording interaction...                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Agent Actions:                                         │
│  ✓ Navigated to localhost:3000                         │
│  ✓ Entered test flight number                          │
│  ✓ Clicked search button                               │
│  ✓ Verified results displayed                          │
│  ✓ Took screenshot                                      │
│  🎥 Recording walkthrough (15s)                         │
│                                                         │
│  [View Screenshot] [View Recording] [Manual Control]    │
└─────────────────────────────────────────────────────────┘
```

**Key Capabilities:**

- Agent can navigate, click, type, scroll
- Capture screenshots at each step
- Record video walkthroughs (15-30 second clips)
- Test form validation, user flows
- Verify visual regressions
- Present final walkthrough to human

**Implementation Requirements:**

- Embed Chromium using Playwright
- Create browser panel in IDE
- Expose browser control to agent
- Screenshot capture API
- Video recording (use Playwright's video feature)
- Overlay agent actions on screen
- Save artifacts to ledger

### 2.5 BYOM ADAPTER SYSTEM (CRITICAL - NO VENDOR LOCK-IN)

**Philosophy:** Users control which models they use, not the IDE.

#### **Model Provider Interface (Universal)**

```typescript
interface ModelProvider {
  // Basic info
  name: string;              // "Ollama", "Anthropic", "OpenAI", "Custom"
  type: 'local' | 'api';    // Local = no internet, API = cloud
  requiresAuth: boolean;     // false for Ollama, true for cloud APIs
  
  // Capabilities
  supportsStreaming: boolean;
  supportsTools: boolean;
  maxContextTokens: number;
  
  // Core methods
  generate(prompt: string, options: GenerateOptions): Promise<string>;
  generateStream(prompt: string, options: GenerateOptions): AsyncIterableIterator<string>;
  isAvailable(): Promise<boolean>;
  getInfo(): Promise<ModelInfo>;
  
  // Tool calling (optional)
  toolCall?(messages: Message[], tools: Tool[]): Promise<ToolCallResponse>;
}
```

#### **Built-in Adapters**

**1. Ollama Adapter (Primary for Offline)**

```typescript
class OllamaAdapter implements ModelProvider {
  name = 'Ollama';
  type = 'local';
  requiresAuth = false;
  
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
        }
      })
    });
  
    const data = await response.json();
    return data.response;
  }
  
  async *generateStream(prompt: string, options: GenerateOptions) {
    const response = await fetch(`${this.baseURL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
      })
    });
  
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
    
      const text = decoder.decode(value);
      const lines = text.split('\n').filter(Boolean);
    
      for (const line of lines) {
        const data = JSON.parse(line);
        if (data.response) {
          yield data.response;
        }
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
  
  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseURL}/api/tags`);
    const data = await response.json();
    return data.models.map((m: any) => m.name);
  }
}
```

**2. Anthropic Claude Adapter**

```typescript
class AnthropicAdapter implements ModelProvider {
  name = 'Anthropic';
  type = 'api';
  requiresAuth = true;
  
  constructor(
    private apiKey: string,
    private model: string = 'claude-sonnet-4-20250514'
  ) {}
  
  async generate(prompt: string, options: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens ?? 4096,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
      })
    });
  
    const data = await response.json();
    return data.content[0].text;
  }
  
  // Similar streaming implementation...
}
```

**3. OpenAI Adapter**

```typescript
class OpenAIAdapter implements ModelProvider {
  name = 'OpenAI';
  type = 'api';
  requiresAuth = true;
  
  constructor(
    private apiKey: string,
    private model: string = 'gpt-4o-mini'
  ) {}
  
  async generate(prompt: string, options: GenerateOptions): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      })
    });
  
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

**4. Custom Endpoint Adapter (OpenAI-Compatible)**

```typescript
class CustomAdapter implements ModelProvider {
  name = 'Custom';
  type = 'local' | 'api';
  requiresAuth: boolean;
  
  constructor(
    private baseURL: string,
    private apiKey?: string,
    private model: string = 'default'
  ) {
    this.requiresAuth = !!apiKey;
    this.type = baseURL.includes('localhost') ? 'local' : 'api';
  }
  
  // Uses OpenAI-compatible format
  async generate(prompt: string, options: GenerateOptions): Promise<string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
  
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
  
    const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.7,
      })
    });
  
    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

**5. HuggingFace Adapter (Local with transformers.js)**

```typescript
class HuggingFaceLocalAdapter implements ModelProvider {
  name = 'HuggingFace Local';
  type = 'local';
  requiresAuth = false;
  
  private pipeline: any;
  
  constructor(private modelId: string = 'Xenova/codegen-350M-mono') {}
  
  async initialize(): Promise<void> {
    // Using transformers.js for browser/Node.js
    const { pipeline } = await import('@xenova/transformers');
    this.pipeline = await pipeline('text-generation', this.modelId);
  }
  
  async generate(prompt: string, options: GenerateOptions): Promise<string> {
    if (!this.pipeline) await this.initialize();
  
    const output = await this.pipeline(prompt, {
      max_length: options.maxTokens ?? 512,
      temperature: options.temperature ?? 0.7,
    });
  
    return output[0].generated_text;
  }
}
```

#### **Model Registry & Configuration**

**AdapterRegistry.ts:**

```typescript
class AdapterRegistry {
  private adapters: Map<string, ModelProvider> = new Map();
  private defaultAdapter: string = 'ollama';
  
  register(id: string, adapter: ModelProvider): void {
    this.adapters.set(id, adapter);
  }
  
  get(id: string): ModelProvider | undefined {
    return this.adapters.get(id);
  }
  
  list(): ModelProviderInfo[] {
    return Array.from(this.adapters.entries()).map(([id, adapter]) => ({
      id,
      name: adapter.name,
      type: adapter.type,
      requiresAuth: adapter.requiresAuth,
      available: false, // checked async
    }));
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
      throw new Error('No default adapter configured');
    }
    return adapter;
  }
}

// Initialize registry with defaults
export const registry = new AdapterRegistry();

// Register Ollama (always available)
registry.register('ollama', new OllamaAdapter());

// Users can add their own
registry.register('claude', new AnthropicAdapter(process.env.ANTHROPIC_API_KEY!));
registry.register('openai', new OpenAIAdapter(process.env.OPENAI_API_KEY!));
```

#### **Model Selection UI**

**Settings Panel:**

```tsx
function ModelSettings() {
  const [adapters, setAdapters] = useState<ModelProviderInfo[]>([]);
  const [selectedDefault, setSelectedDefault] = useState('ollama');
  
  useEffect(() => {
    // Load available adapters
    const list = registry.list();
    setAdapters(list);
  
    // Check availability
    list.forEach(async (info) => {
      const adapter = registry.get(info.id);
      if (adapter) {
        info.available = await adapter.isAvailable();
      }
    });
  }, []);
  
  return (
    <div className="model-settings">
      <h2>Model Providers</h2>
    
      <div className="provider-list">
        {adapters.map(adapter => (
          <div key={adapter.id} className="provider-card">
            <h3>{adapter.name}</h3>
            <span className={adapter.type}>{adapter.type}</span>
            <span className={adapter.available ? 'available' : 'unavailable'}>
              {adapter.available ? '✓ Available' : '✗ Unavailable'}
            </span>
          
            {adapter.id === selectedDefault && <span className="badge">Default</span>}
          
            <button onClick={() => setSelectedDefault(adapter.id)}>
              Set as Default
            </button>
          
            <button onClick={() => configureAdapter(adapter.id)}>
              Configure
            </button>
          </div>
        ))}
      </div>
    
      <button onClick={addCustomAdapter}>+ Add Custom Adapter</button>
    </div>
  );
}

function configureAdapter(id: string) {
  // Show configuration modal
  if (id === 'ollama') {
    return (
      <OllamaConfig
        baseURL={config.ollamaURL}
        models={['codellama:7b', 'deepseek-coder:6.7b', 'qwen2.5-coder:7b']}
        onSave={(baseURL, model) => {
          registry.register('ollama', new OllamaAdapter(baseURL, model));
        }}
      />
    );
  }
  
  if (id === 'claude' || id === 'openai') {
    return (
      <APIKeyConfig
        provider={id}
        onSave={(apiKey, model) => {
          if (id === 'claude') {
            registry.register('claude', new AnthropicAdapter(apiKey, model));
          } else {
            registry.register('openai', new OpenAIAdapter(apiKey, model));
          }
        }}
      />
    );
  }
}

function addCustomAdapter() {
  return (
    <CustomAdapterConfig
      onSave={(name, baseURL, apiKey, model) => {
        const adapter = new CustomAdapter(baseURL, apiKey, model);
        registry.register(name.toLowerCase(), adapter);
      }}
    />
  );
}
```

#### **Per-Agent Model Selection**

```tsx
function CreateAgentModal() {
  const [selectedModel, setSelectedModel] = useState('ollama');
  const adapters = registry.list().filter(a => a.available);
  
  return (
    <Modal title="Create New Agent">
      <Input
        label="Agent Name"
        placeholder="Feature Builder"
      />
    
      <Select
        label="Model Provider"
        value={selectedModel}
        onChange={setSelectedModel}
      >
        {adapters.map(adapter => (
          <option key={adapter.id} value={adapter.id}>
            {adapter.name} ({adapter.type})
          </option>
        ))}
      </Select>
    
      {selectedModel === 'ollama' && (
        <Select label="Model">
          <option value="codellama:7b">Codellama 7B (Code)</option>
          <option value="deepseek-coder:6.7b">Deepseek Coder 6.7B (Fast)</option>
          <option value="qwen2.5-coder:7b">Qwen 2.5 Coder 7B (Smart)</option>
          <option value="llama3.2:3b">Llama 3.2 3B (General)</option>
        </Select>
      )}
    
      <Input
        label="Task Description"
        placeholder="What should this agent do?"
        multiline
      />
    
      <Button onClick={createAgent}>Create Agent</Button>
    </Modal>
  );
}
```

#### **Dynamic Model Switching**

**Agent can switch models mid-task based on complexity:**

```typescript
class Agent {
  private modelProvider: ModelProvider;
  
  async executeTask(task: Task): Promise<void> {
    // Use fast local model for simple tasks
    if (task.complexity === 'low') {
      this.modelProvider = registry.get('ollama')!;
    }
  
    // Use powerful model for complex tasks
    if (task.complexity === 'high') {
      // Try Claude if available, fallback to Ollama
      const claude = registry.get('claude');
      if (claude && await claude.isAvailable()) {
        this.modelProvider = claude;
      } else {
        // Use larger Ollama model
        this.modelProvider = new OllamaAdapter('http://localhost:11434', 'qwen2.5-coder:32b');
      }
    }
  
    // Execute with selected model
    const response = await this.modelProvider.generate(task.prompt);
  }
}
```

#### **Model Committee Mode (Advanced)**

**Multiple models vote on decision:**

```typescript
async function committeeMode(prompt: string): Promise<string> {
  const models = [
    registry.get('ollama'),
    registry.get('claude'),
    registry.get('openai'),
  ].filter(Boolean) as ModelProvider[];
  
  // Get responses from all models
  const responses = await Promise.all(
    models.map(model => model.generate(prompt))
  );
  
  // Show all responses to user
  showCommitteeResults(responses);
  
  // Let user choose or have models vote
  return await userSelectsOrModelsVote(responses);
}
```

#### **BYOM Configuration File**

**`.aiiderc.json` in project root:**

```json
{
  "models": {
    "default": "ollama",
    "providers": {
      "ollama": {
        "type": "local",
        "baseURL": "http://localhost:11434",
        "defaultModel": "codellama:7b",
        "models": {
          "code": "codellama:7b",
          "general": "llama3.2:3b",
          "complex": "qwen2.5-coder:32b"
        }
      },
      "claude": {
        "type": "api",
        "apiKey": "${ANTHROPIC_API_KEY}",
        "model": "claude-sonnet-4-20250514",
        "enabled": false
      },
      "custom": {
        "type": "api",
        "baseURL": "http://my-gpu-server:8000",
        "model": "custom-finetuned-model",
        "enabled": true
      }
    }
  },
  "agentDefaults": {
    "codeGeneration": "ollama.code",
    "planning": "ollama.complex",
    "testing": "ollama.general"
  }
}
```

#### **Model Metrics & Monitoring**

```typescript
interface ModelMetrics {
  provider: string;
  model: string;
  totalRequests: number;
  totalTokens: number;
  avgLatency: number; // ms
  successRate: number; // %
  cost: number; // $ (0 for local)
}

class MetricsCollector {
  async track(provider: string, model: string, request: Request): Promise<void> {
    const start = Date.now();
  
    try {
      const response = await execute(request);
      const duration = Date.now() - start;
    
      await db.metrics.insert({
        provider,
        model,
        tokens: countTokens(response),
        latency: duration,
        success: true,
        timestamp: new Date(),
      });
    } catch (error) {
      await db.metrics.insert({
        provider,
        model,
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
    }
  }
  
  async getMetrics(provider: string): Promise<ModelMetrics> {
    // Aggregate from database
    return await db.metrics.aggregate({ provider });
  }
}

// Show in UI
function ModelMetricsPanel() {
  const [metrics, setMetrics] = useState<ModelMetrics[]>([]);
  
  return (
    <div className="metrics">
      <h2>Model Performance</h2>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Requests</th>
            <th>Avg Latency</th>
            <th>Success Rate</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map(m => (
            <tr key={m.provider}>
              <td>{m.provider}</td>
              <td>{m.totalRequests}</td>
              <td>{m.avgLatency}ms</td>
              <td>{m.successRate}%</td>
              <td>${m.cost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### BYOM ADVANTAGES OVER CURSOR/ANTIGRAVITY

| Feature                    | Cursor   | Antigravity  | Your IDE                 |
| -------------------------- | -------- | ------------ | ------------------------ |
| **Local Models**     | ❌ No    | ⚠️ Limited | ✅ Full Ollama support   |
| **API Keys**         | Required | Required     | Optional                 |
| **Custom Endpoints** | ❌ No    | ❌ No        | ✅ Any OpenAI-compatible |
| **Model Switching**  | ❌ No    | ✅ Limited   | ✅ Per agent/task        |
| **HuggingFace**      | ❌ No    | ❌ No        | ✅ Yes                   |
| **Zero Cost Option** | ❌ No    | ❌ No        | ✅ Yes (Ollama)          |
| **Offline Mode**     | ❌ No    | ❌ No        | ✅ 100%                  |
| **Committee Mode**   | ❌ No    | ❌ No        | ✅ Multi-model voting    |
| **Metrics**          | Hidden   | Hidden       | ✅ Full visibility       |

**Your competitive advantage: TRUE BYOM with zero vendor lock-in!**

Antigravity's killer feature: Agents produce **structured artifacts** instead of raw tool calls.

#### **Artifact Types:**

**1. Implementation Plan**

```markdown
# Implementation Plan: Flight Tracker Feature

## Overview
Build Next.js app with flight lookup using mock API

## Research Phase ✓
- Investigated aviation APIs (FlightAware, AviationStack)
- Decision: Use mock data for MVP, prepare for real API later
- Estimated complexity: Medium

## Implementation Steps
1. ✓ Scaffold Next.js project
2. ✓ Create FlightSearch component
3. ⏳ Implement mock API endpoints
4. ⏸️  Add error handling
5. ⏸️  Style with Tailwind

## Verification Plan
- Unit tests for components
- Integration test for API calls
- Browser testing for user flow
- Screenshot comparison for UI

## Risks & Mitigations
- Risk: API rate limits
  Mitigation: Mock data for development

## Human Review Points
- ✓ Architecture approved
- ⏸️  UI design approval needed before styling
```

**2. Task List Artifact**

```json
{
  "taskList": [
    {
      "id": "task-1",
      "description": "Research aviation APIs",
      "status": "completed",
      "duration": "5 minutes",
      "findings": "FlightAware API requires paid plan, using mock for now"
    },
    {
      "id": "task-2", 
      "description": "Scaffold Next.js project",
      "status": "completed",
      "commands": ["npx create-next-app@latest flight-tracker"],
      "duration": "2 minutes"
    },
    {
      "id": "task-3",
      "description": "Implement UI components",
      "status": "in_progress",
      "files": ["src/components/FlightSearch.tsx"],
      "completion": 60
    }
  ]
}
```

**3. Screenshot Artifact**

- Image file (PNG)
- Metadata: timestamp, page URL, viewport size
- Annotations: Agent highlights what's being tested
- Diff comparison if UI changed

**4. Walkthrough Recording**

- Video file (WebM, 15-30 seconds)
- Shows agent interacting with app
- Narration: "Here's the flight search. I'm entering UA1234. Results appear correctly."
- Stored in artifacts folder

**5. Code Diff Artifact**

```diff
File: src/app/page.tsx

+ import FlightSearch from '@/components/FlightSearch'
+ 
  export default function Home() {
    return (
-     <div>Hello World</div>
+     <div>
+       <h1>Flight Tracker</h1>
+       <FlightSearch />
+     </div>
    )
  }

Agent Comment: Added FlightSearch component to homepage.
Rationale: Per implementation plan, this is the main entry point.
```

**6. Test Results Artifact**

```json
{
  "testSuite": "Flight Tracker Tests",
  "timestamp": "2025-11-19T10:30:00Z",
  "results": {
    "passed": 8,
    "failed": 0,
    "skipped": 1
  },
  "tests": [
    {
      "name": "FlightSearch renders",
      "status": "passed",
      "duration": 150
    },
    {
      "name": "Search button is clickable",
      "status": "passed",
      "duration": 75
    }
  ],
  "coverage": {
    "lines": 87.5,
    "functions": 92.3,
    "branches": 81.2
  }
}
```

#### **Artifact Viewer UI**

```
┌─────────────────────────────────────────────────────────┐
│  📄 Implementation Plan                                  │
├─────────────────────────────────────────────────────────┤
│  [Plan] [Diffs] [Screenshots] [Tests] [Recording]       │
│                                                         │
│  # Implementation Plan: Flight Tracker Feature          │
│                                                         │
│  ## Overview                                            │
│  Build Next.js app with flight lookup...               │
│                                                         │
│  💬 Your comment:                                       │
│  ┌────────────────────────────────────────────────┐    │
│  │ Can we use TailwindCSS instead of CSS modules? │    │
│  │ [Post Comment]                                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  💬 Agent reply (2 minutes ago):                        │
│  "Good suggestion! I'll update the styling approach    │
│   to use Tailwind. Adding this to task list."          │
│                                                         │
│  [Mark as Approved] [Request Changes]                   │
└─────────────────────────────────────────────────────────┘
```

**Implementation Requirements:**

- Artifact storage in SQLite
- Markdown renderer for plans
- Image viewer for screenshots
- Video player for recordings
- Diff viewer for code changes
- Comment system (like Google Docs)
- Approval workflow UI

---

### 2.3 FEEDBACK SYSTEM (Google Docs-style)

**Critical Feature:** You can comment on ANY artifact, and agent automatically incorporates feedback.

#### **Comment Types:**

**1. Inline Code Comments**

```typescript
function fetchFlight(flightNumber: string) {
  // 💬 Human: Should we add error handling here?
  
  return fetch(`/api/flights/${flightNumber}`)
}

// Agent automatically sees comment, adds to task list:
// "Add error handling to fetchFlight function"
```

**2. Plan Comments**

```markdown
## Step 3: Implement UI
- Create FlightSearch component
- Add input validation

💬 Human: "Can we also add a loading spinner?"
👍 Agent: "Added to task list. Will implement after input validation."
```

**3. Screenshot Comments**

```
[Screenshot of UI]

💬 Human selects button, adds comment:
"This button should be blue, not green"

Agent response:
"Updated styling in task list. Will fix in next iteration."
```

**Implementation:**

- Click anywhere on artifact to add comment
- Comments stored with artifact ID + position
- Agent polls for new comments every 10 seconds
- Agent LLM call: "User commented: [comment]. Update your plan accordingly."
- Agent adds to task list automatically
- Human sees "Comment acknowledged" notification

---

### 2.4 KNOWLEDGE BASE SYSTEM

**Self-Improvement:** Agents learn from successful patterns and reuse them.

#### **Knowledge Items:**

**Structure:**

```typescript
interface KnowledgeItem {
  id: string;
  type: 'pattern' | 'snippet' | 'task_template' | 'decision';
  title: string;
  content: string;
  context: {
    project: string;
    language: string;
    framework: string;
  };
  metadata: {
    usageCount: number;
    lastUsed: Date;
    successRate: number; // % of times it worked
  };
  tags: string[];
}
```

**Example Knowledge Items:**

**1. Code Pattern**

```typescript
{
  "type": "pattern",
  "title": "Error Handling for API Calls",
  "content": `
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      return { error: error.message };
    }
  `,
  "context": {
    "language": "typescript",
    "framework": "react"
  },
  "usageCount": 12,
  "successRate": 100
}
```

**2. Task Template**

```json
{
  "type": "task_template",
  "title": "Add New React Component",
  "content": {
    "steps": [
      "Create component file in src/components/",
      "Write component with TypeScript types",
      "Add unit tests in __tests__/",
      "Export from index.ts",
      "Import and use in parent component"
    ]
  },
  "usageCount": 25,
  "successRate": 96
}
```

**3. Decision Record**

```json
{
  "type": "decision",
  "title": "Use Zod for validation over Yup",
  "content": "Team prefers Zod for type inference. Used in auth form validation successfully.",
  "context": {
    "project": "flight-tracker"
  },
  "usageCount": 5
}
```

#### **Knowledge Retrieval:**

When agent starts new task:

1. Search knowledge base for similar patterns
2. Retrieve top 5 relevant items
3. Include in agent's context
4. Agent references: "Based on past work, I'll use error handling pattern #42"

**Implementation:**

- Vector embeddings for semantic search
- LevelDB for storage
- Automatic extraction from successful tasks
- Human can manually add knowledge items
- UI to browse/edit/delete knowledge base

---

## PART 3: AGENT EXECUTION FLOW

### 3.1 Complete Agent Workflow

**User Input:** "Build a flight tracker app"

**Step 1: Planning (Gemini 3 Pro)**

```
Agent thinks:
1. This requires Next.js setup
2. Need UI for input
3. Need API (mock for now)
4. Need tests
5. Need browser verification

Agent produces: Implementation Plan Artifact
```

**Step 2: Research Phase**

```
Agent actions:
- Search codebase for existing components
- Check knowledge base for similar patterns
- Research aviation APIs (web search tool)
- Create research notes artifact

Agent produces: Research Notes Artifact
```

**Step 3: Human Approval**

```
Notification: "Agent has created a plan. Review?"

Human clicks → Views Implementation Plan
Human comments: "Use Tailwind instead of CSS modules"
Human clicks: [Approve Plan]

Agent sees approval + comment, updates task list
```

**Step 4: Execution**

```
For each task in plan:
  1. Check knowledge base for pattern
  2. Execute action (write code, run command, etc.)
  3. Capture result as artifact
  4. Update progress
  5. Check for human comments
  6. If comment → adjust plan
  7. Continue
```

**Step 5: Verification**

```
Agent:
1. Runs all tests
2. Captures test results as artifact
3. Launches browser
4. Navigates to localhost:3000
5. Interacts with UI (type, click, etc.)
6. Takes screenshots
7. Records 15-second walkthrough
8. Produces walkthrough artifact
```

**Step 6: Final Review**

```
Agent: "Task complete. Here's what I built:"

Artifacts presented:
- Implementation Plan ✓
- Code Diffs (5 files changed)
- Test Results (8/8 passed)
- Screenshot (UI working)
- Walkthrough Video (15 seconds)

Human reviews artifacts → Clicks [Approve & Merge]
```

---

### 3.2 Detailed Agent Prompt Template

**System Prompt for Agent:**

```
You are an autonomous coding agent in Google Antigravity IDE. You work across three surfaces: Editor, Terminal, and Browser.

YOUR WORKFLOW:
1. PLAN - Create detailed implementation plan
2. RESEARCH - Search codebase, knowledge base, web
3. IMPLEMENT - Write code, run commands, test in browser
4. VERIFY - Run tests, capture screenshots, record walkthrough
5. PRESENT - Show artifacts for human review

AVAILABLE TOOLS:
- read_file: Read any file in workspace
- write_file: Create or modify files
- execute_command: Run terminal commands
- browser_navigate: Open URL in browser
- browser_click: Click element
- browser_type: Type text
- browser_screenshot: Capture screenshot
- browser_record: Record video
- knowledge_search: Search knowledge base
- create_artifact: Save plan, screenshot, etc.
- read_comments: Check for human feedback

ARTIFACT TYPES YOU MUST PRODUCE:
1. Implementation Plan - Before starting work
2. Task List - Updated throughout execution
3. Code Diffs - For every file changed
4. Test Results - After running tests
5. Screenshots - Key UI states
6. Walkthrough Recording - Final product demo

HUMAN INTERACTION:
- Wait for plan approval before executing
- Check for comments every 5 minutes
- If human comments, acknowledge and adjust plan
- If uncertain, ask for clarification via artifact comment
- Always explain your reasoning

VERIFICATION STANDARD:
- Don't just write code - TEST it
- Run in browser and verify it works
- Take screenshots proving functionality
- Record walkthrough showing user flow
- Run all tests and capture results

KNOWLEDGE BASE:
- Search knowledge base for relevant patterns
- Reuse successful approaches
- Add new patterns when you solve something novel
- Reference knowledge items in your plans

EXAMPLE WORKFLOW:
User: "Add authentication"
You:
1. Create Implementation Plan artifact
   - Research: Check codebase for existing auth
   - Plan: Use NextAuth.js, add login page, protect routes
   - Tasks: 6 steps with dependencies
2. Wait for human approval
3. Execute each task:
   - Install nextauth
   - Create [...nextauth]/route.ts
   - Add login page
   - Protect dashboard route
   - Write tests
4. Browser verification:
   - Navigate to /login
   - Enter test credentials
   - Verify redirect to dashboard
   - Try accessing protected route without auth
   - Screenshot each step
   - Record 15-second walkthrough
5. Present artifacts for review

Always work at TASK level, not line level. Think like a senior developer who delegates well.
```

---

## PART 4: TECHNICAL IMPLEMENTATION

### 4.1 Technology Stack (Revised for Antigravity-style)

```
Base: VSCode Fork (MIT License)
├── Frontend: React 18+ (already in VSCode)
├── Backend: Node.js (Electron main process)
├── Agent Runtime: TypeScript
├── Model Provider: Ollama (local) + API adapters
├── Browser: Playwright with Chromium
├── Storage: SQLite (artifacts) + LevelDB (knowledge base)
├── Embeddings: Local transformer.js or sentence-transformers
└── IPC: Electron IPC + WebSockets (for real-time updates)
```

---

### 4.2 Core Packages Structure

```
/packages
├── agent-runtime/          # Core agent engine
│   ├── Agent.ts           # Agent class with state machine
│   ├── Planner.ts         # Creates implementation plans
│   ├── Executor.ts        # Executes tasks
│   ├── Verifier.ts        # Runs verification
│   └── Scheduler.ts       # Manages multiple agents
│
├── artifact-system/        # Artifact management
│   ├── ArtifactStore.ts   # SQLite storage
│   ├── ArtifactViewer.ts  # UI for viewing artifacts
│   ├── CommentSystem.ts   # Google Docs-style comments
│   └── types.ts           # Artifact type definitions
│
├── knowledge-base/         # Self-improvement system
│   ├── KnowledgeStore.ts  # LevelDB storage
│   ├── Extractor.ts       # Extract patterns from successful tasks
│   ├── Retriever.ts       # Semantic search
│   └── UI.tsx             # Browse/edit knowledge
│
├── browser-control/        # Playwright integration
│   ├── BrowserManager.ts  # Launch/control browser
│   ├── Recorder.ts        # Video recording
│   ├── Screenshot.ts      # Capture screenshots
│   └── BrowserPanel.tsx   # UI component
│
├── agent-manager-ui/       # Mission Control UI
│   ├── ManagerView.tsx    # Main manager interface
│   ├── AgentCard.tsx      # Individual agent card
│   ├── TaskList.tsx       # Task progress
│   └── ArtifactGrid.tsx   # Artifact thumbnails
│
└── model-provider/         # Your existing adapter system
    ├── OllamaAdapter.ts
    └── APIAdapter.ts
```

---

### 4.3 Agent Manager Implementation

**File: agent-manager-ui/ManagerView.tsx**

**Component Structure:**

```tsx
interface ManagerViewProps {
  workspace: Workspace;
}

export function ManagerView({ workspace }: ManagerViewProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  return (
    <div className="manager-view">
      <header>
        <h1>Agent Manager</h1>
        <button onClick={createNewAgent}>+ New Agent</button>
      </header>
    
      <div className="agent-grid">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={() => setSelectedAgent(agent)}
            onPause={() => pauseAgent(agent.id)}
            onComment={() => openCommentModal(agent)}
          />
        ))}
      </div>
    
      {selectedAgent && (
        <AgentDetail agent={selectedAgent} />
      )}
    </div>
  );
}
```

**AgentCard Component:**

```tsx
function AgentCard({ agent, onSelect, onPause, onComment }: AgentCardProps) {
  const progress = calculateProgress(agent.tasks);
  
  return (
    <div className="agent-card" onClick={onSelect}>
      <div className="agent-header">
        <span className="agent-icon">🤖</span>
        <h3>{agent.name}</h3>
        <StatusBadge status={agent.status} />
      </div>
    
      <div className="agent-progress">
        <ProgressBar value={progress} />
        <span>{progress}% complete</span>
      </div>
    
      <div className="agent-tasks">
        {agent.tasks.slice(0, 3).map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    
      <div className="agent-artifacts">
        <span>Artifacts: {agent.artifacts.length}</span>
        <div className="artifact-thumbnails">
          {agent.artifacts.slice(0, 3).map(artifact => (
            <ArtifactThumbnail key={artifact.id} artifact={artifact} />
          ))}
        </div>
      </div>
    
      <div className="agent-actions">
        <button onClick={onPause}>
          {agent.status === 'running' ? 'Pause' : 'Resume'}
        </button>
        <button onClick={onComment}>Comment</button>
        <button onClick={() => viewArtifacts(agent)}>View All</button>
      </div>
    </div>
  );
}
```

---

### 4.4 Browser Control Implementation

**File: browser-control/BrowserManager.ts**

```typescript
import { chromium, Browser, Page } from 'playwright';

export class BrowserManager {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private recording: boolean = false;
  
  async launch(): Promise<void> {
    this.browser = await chromium.launch({
      headless: false, // Show browser in IDE
      args: ['--disable-web-security'], // For localhost testing
    });
  
    const context = await this.browser.newContext({
      recordVideo: {
        dir: './artifacts/videos/',
        size: { width: 1280, height: 720 }
      }
    });
  
    this.page = await context.newPage();
  }
  
  async navigate(url: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');
    await this.page.goto(url);
  
    // Create navigation artifact
    await this.createArtifact({
      type: 'browser_action',
      action: 'navigate',
      url,
      timestamp: new Date(),
    });
  }
  
  async click(selector: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');
  
    // Highlight element before clicking
    await this.page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.style.outline = '3px solid red';
        setTimeout(() => el.style.outline = '', 1000);
      }
    }, selector);
  
    await this.page.click(selector);
  
    // Create click artifact
    await this.createArtifact({
      type: 'browser_action',
      action: 'click',
      selector,
      timestamp: new Date(),
    });
  }
  
  async type(selector: string, text: string): Promise<void> {
    if (!this.page) throw new Error('Browser not launched');
    await this.page.fill(selector, text);
  
    await this.createArtifact({
      type: 'browser_action',
      action: 'type',
      selector,
      text,
      timestamp: new Date(),
    });
  }
  
  async screenshot(name: string): Promise<string> {
    if (!this.page) throw new Error('Browser not launched');
  
    const path = `./artifacts/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: false });
  
    // Create screenshot artifact
    const artifact = await this.createArtifact({
      type: 'screenshot',
      path,
      url: this.page.url(),
      timestamp: new Date(),
    });
  
    return artifact.id;
  }
  
  async startRecording(): Promise<void> {
    this.recording = true;
    // Recording automatically starts with context.recordVideo
  }
  
  async stopRecording(): Promise<string> {
    this.recording = false;
  
    // Close page to save video
    const videoPath = await this.page?.video()?.path();
  
    if (videoPath) {
      // Create recording artifact
      const artifact = await this.createArtifact({
        type: 'recording',
        path: videoPath,
        duration: 15, // seconds
        timestamp: new Date(),
      });
    
      return artifact.id;
    }
  
    throw new Error('No recording available');
  }
  
  async createWalkthrough(steps: BrowserStep[]): Promise<string> {
    // Execute steps and record
    await this.startRecording();
  
    for (const step of steps) {
      switch (step.action) {
        case 'navigate':
          await this.navigate(step.url!);
          break;
        case 'click':
          await this.click(step.selector!);
          break;
        case 'type':
          await this.type(step.selector!, step.text!);
          break;
        case 'wait':
          await this.page?.waitForTimeout(step.duration || 1000);
          break;
      }
    
      // Take screenshot after each step
      await this.screenshot(`step-${step.name}`);
    }
  
    const recordingId = await this.stopRecording();
  
    // Create walkthrough artifact
    const artifact = await this.createArtifact({
      type: 'walkthrough',
      steps,
      recordingId,
      screenshots: [], // populated above
      timestamp: new Date(),
    });
  
    return artifact.id;
  }
  
  private async createArtifact(data: any): Promise<Artifact> {
    // Save to artifact store
    return await ArtifactStore.create(data);
  }
}
```

---

### 4.5 Comment System Implementation

**File: artifact-system/CommentSystem.ts**

```typescript
interface Comment {
  id: string;
  artifactId: string;
  position: CommentPosition; // line number, or x/y for images
  author: 'human' | 'agent';
  content: string;
  timestamp: Date;
  resolved: boolean;
  replies: Comment[];
}

export class CommentSystem {
  private comments: Map<string, Comment[]> = new Map();
  private pollInterval: NodeJS.Timeout | null = null;
  
  // Start polling for new comments (agent checks every 10s)
  startPolling(agentId: string): void {
    this.pollInterval = setInterval(async () => {
      const newComments = await this.getUnreadComments(agentId);
    
      if (newComments.length > 0) {
        // Process comments and update agent's plan
        await this.processComments(agentId, newComments);
      }
    }, 10000); // 10 seconds
  }
  
  async addComment(
    artifactId: string,
    position: CommentPosition,
    content: string,
    author: 'human' | 'agent'
  ): Promise<Comment> {
    const comment: Comment = {
      id: generateId(),
      artifactId,
      position,
      author,
      content,
      timestamp: new Date(),
      resolved: false,
      replies: [],
    };
  
    // Save to database
    await db.comments.insert(comment);
  
    // Notify agent if human commented
    if (author === 'human') {
      await this.notifyAgent(artifactId, comment);
    }
  
    return comment;
  }
  
  private async processComments(
    agentId: string,
    comments: Comment[]
  ): Promise<void> {
    for (const comment of comments) {
      // Call LLM to understand comment and update plan
      const response = await callModelProvider({
        model: 'gemini-3-pro',
        prompt: `
          User commented on your work: "${comment.content}"
        
          Current task list:
          ${JSON.stringify(agent.tasks)}
        
          How should you respond and adjust your plan?
        
          Respond with:
          1. Acknowledgment message for user
          2. Updated task list if changes needed
        `,
      });
    
      // Parse response
      const { acknowledgment, updatedTasks } = parseResponse(response);
    
      // Reply to comment
      await this.addComment(
        comment.artifactId,
        comment.position,
        acknowledgment,
        'agent'
      );
    
      // Update task list if needed
      if (updatedTasks) {
        await agent.updateTasks(updatedTasks);
      }
    
      // Mark comment as processed
      await db.comments.update(comment.id, { resolved: true });
    }
  }
  
  // UI Component
  renderComments(artifactId: string): React.ReactNode {
    const comments = this.getComments(artifactId);
  
    return (
      <div className="comments-panel">
        {comments.map(comment => (
          <CommentThread key={comment.id} comment={comment} />
        ))}
      
        <CommentInput
          onSubmit={(content, position) =>
            this.addComment(artifactId, position, content, 'human')
          }
        />
      </div>
    );
  }
}
```

---

## PART 5: PROMPTS FOR JULES

### 5.1 Master Build Prompt

**PROMPT 1: Initial Setup**

```
TASK: Brand VSCode as Ai IDE

STEPS:
1. Rename project to "ai-ide"
2. Update branding:
   - Change logo (create new dummy icon)
   - Update app name in package.json
   - Change window title
   - Update splash screen
   
3. Build verification:
   - Run `yarn && yarn watch`
   - Verify app launches
   - Verify editor works
   
4. Create extension scaffolding:
   - Create extension: agent-manager
   - Create extension: artifact-viewer
   - Create extension: browser-panel
   - Create extension: knowledge-base
   
DELIVERABLE: Branded VSCode fork that builds and runs
```

---

**PROMPT 2: Agent Manager UI**

```
TASK: Build Agent Manager (Mission Control) Interface

REQUIREMENTS:
1. Create new VSCode view container (like Explorer/Search)
2. Register view: "Agent Manager"
3. Implement AgentCard component showing:
   - Agent name and status
   - Progress bar
   - Task list (collapsible)
   - Artifact thumbnails
   - Action buttons (Pause/Comment/Details)
   
4. Implement ManagerView layout:
   - Grid of agent cards
   - "+ New Agent" button
   - Filter controls (Active/Paused/Completed)
   - Keyboard shortcut: CMD+Shift+M to toggle
   
5. Real-time updates:
   - WebSocket connection to agent runtime
   - Update progress every second
   - Animate task completion
   
6. Interactions:
   - Click agent card → show detail panel
   - Click artifact → open artifact viewer
   - Click pause → pause agent execution
   - Click comment → open comment modal
   
DELIVERABLE: Working Agent Manager view in sidebar
```

---

**PROMPT 3: Artifact System**

```
TASK: Implement Complete Artifact System

REQUIREMENTS:
1. Database schema (SQLite):
   CREATE TABLE artifacts (
     id TEXT PRIMARY KEY,
     type TEXT, -- plan, screenshot, recording, diff, etc.
     agent_id TEXT,
     task_id TEXT,
     content BLOB,
     metadata JSON,
     created_at DATETIME,
     FOREIGN KEY (agent_id) REFERENCES agents(id)
   );
   
2. Artifact types to implement:
   - Implementation Plan (Markdown)
   - Task List (JSON)
   - Screenshot (PNG image)
   - Recording (WebM video)
   - Code Diff (unified diff format)
   - Test Results (JSON)
   
3. ArtifactStore class:
   - create(type, content, metadata)
   - get(id)
   - list(agentId)
   - delete(id)
   - search(query)
   
4. Artifact Viewer UI:
   - Markdown renderer for plans
   - Image viewer for screenshots
   - Video player for recordings
   - Diff viewer for code changes
   - JSON viewer for test results
   - Tab navigation between artifact types
   
5. Comment system:
   - Click anywhere on artifact to add comment
   - Google Docs-style thread UI
   - Agent polls for new comments
   - Agent auto-replies to comments
   
DELIVERABLE: Complete artifact system with viewer UI
```

---

**PROMPT 4: Browser Integration**

```
TASK: Integrate Playwright Browser into IDE

REQUIREMENTS:
1. Create BrowserPanel component:
   - Embed browser view (use Playwright's CDP)
   - URL bar
   - Agent action overlay (show what agent is doing)
   - Screenshot/Record buttons
   
2. BrowserManager class:
   - launch() - Start Chromium
   - navigate(url)
   - click(selector)
   - type(selector, text)
   - screenshot(name) → returns artifact ID
   - startRecording()
   - stopRecording() → returns artifact ID
   - createWalkthrough(steps[]) → automated flow
   
3. Agent integration:
   - Agent can call browser tools
   - Highlight elements before clicking (red outline)
   - Capture screenshot after each action
   - Record 15-second walkthroughs
   - Save all as artifacts
   
4. UI features:
   - Show browser in third panel (split view)
   - Manual control toggle (user can take over)
   - Action log (list of agent actions)
   - Screenshot gallery at bottom
   
DELIVERABLE: Working browser integration with Playwright
```

---

**PROMPT 5: Agent Runtime Engine**

```
TASK: Build Core Agent Orchestration Engine

REQUIREMENTS:
1. Agent class with state machine:
   States: idle, planning, awaiting_approval, executing, paused, completed, failed
   
2. Workflow implementation:
   async executeTask(intent: string):
     a. Generate implementation plan (call model)
     b. Create plan artifact
     c. Wait for human approval
     d. Execute each step in plan:
        - Call appropriate tool
        - Capture output as artifact
        - Check for human comments
        - Update progress
     e. Verification phase:
        - Run tests
        - Browser walkthrough
        - Capture all as artifacts
     f. Present final artifacts for review
   
3. Tool integration:
   - read_file(path)
   - write_file(path, content)
   - execute_command(cmd, args)
   - browser_navigate(url)
   - browser_click(selector)
   - screenshot(name)
   - create_artifact(type, content)
   
4. Model provider integration:
   - Call Ollama for code generation
   - Call Gemini/Claude for planning
   - Streaming support for progress updates
   
5. Error handling:
   - Retry failed steps (3x with backoff)
   - Request human help if stuck
   - Checkpoint state for resume
   
DELIVERABLE: Complete agent runtime that can execute tasks end-to-end
```

---

**PROMPT 6: Knowledge Base System**

```
TASK: Implement Self-Improving Knowledge Base

REQUIREMENTS:
1. Knowledge storage (LevelDB):
   - Store code patterns, task templates, decisions
   - Vector embeddings for semantic search
   - Usage tracking (count, last used, success rate)
   
2. Extractor:
   - After successful task completion
   - Extract reusable patterns
   - Save to knowledge base
   - Tag with context (language, framework)
   
3. Retriever:
   - Semantic search when agent starts new task
   - Return top 5 relevant patterns
   - Include in agent's context
   
4. UI for knowledge base:
   - Browse all knowledge items
   - Search by keyword or semantic
   - Edit/delete items
   - View usage statistics
   - Manually add patterns
   
DELIVERABLE: Working knowledge base with auto-extraction
```

---

**PROMPT 7: BYOM Adapter System (CRITICAL)**

```
TASK: Build Complete Bring-Your-Own-Model Adapter System

REQUIREMENTS:
1. Universal ModelProvider interface:
   - generate() - basic completion
   - generateStream() - streaming responses
   - isAvailable() - health check
   - getInfo() - model metadata
   
2. Built-in adapters (ALL production-ready):
   
   A. OllamaAdapter (PRIMARY):
      - HTTP client to localhost:11434
      - Support all Ollama models
      - List available models
      - Model pull/delete functionality
      - Streaming support
    
   B. AnthropicAdapter:
      - Claude Sonnet 4.5, Opus, Haiku
      - Tool calling support
      - Streaming with SSE
      - Token counting
    
   C. OpenAIAdapter:
      - GPT-4, GPT-4o, GPT-3.5
      - Function calling
      - Streaming
      - Token usage tracking
    
   D. CustomAdapter:
      - OpenAI-compatible endpoints
      - Support local servers
      - Support any API with compatible format
      - Auto-detect capabilities
    
   E. HuggingFaceAdapter (OPTIONAL):
      - Use transformers.js for browser
      - Small models only (<1GB)
      - CPU-friendly
    
3. AdapterRegistry:
   - Register any adapter dynamically
   - List all available adapters
   - Set default adapter
   - Check health of all adapters
   - Store configuration securely
   
4. Model Selection UI:
   - Settings page with provider list
   - Configure each provider
   - Test connection button
   - Show availability status
   - Model selector per provider
   - Set default for new agents
   
5. Per-Agent Model Selection:
   - Create agent modal with model dropdown
   - Show only available providers
   - Remember last selection
   - Allow switching mid-task
   
6. Configuration:
   - .aiiderc.json for project defaults
   - Environment variables for API keys
   - Secure storage (encrypted) for keys
   - Export/import settings
   
7. Metrics & Monitoring:
   - Track requests per provider
   - Measure latency
   - Count tokens (estimate cost)
   - Success/failure rates
   - Display in dashboard
   
8. Advanced Features:
   - Committee mode (multiple models vote)
   - Automatic fallback (local → API)
   - Model selection based on task complexity
   - Load balancing across providers
   
SECURITY:
- Never log API keys
- Encrypt keys at rest
- Redact keys in error messages
- Validate all URLs before connecting
- Sandbox untrusted custom endpoints

TESTING:
- Mock each adapter for tests
- Test with real Ollama locally
- Test API adapters with test accounts
- Test error cases (timeout, invalid key, etc.)
- Test streaming edge cases

DELIVERABLE: Complete BYOM system with 4+ adapters
```

---

**PROMPT 8: Final Integration & Polish**

```
TASK: Integrate All Systems and Polish UX

REQUIREMENTS:
1. Wire up all components:
   - Agent Manager → Agent Runtime → Tools → Artifacts
   - Comment system feeds back to agents
   - Knowledge base retrieved during planning
   - Browser verification produces artifacts
   
2. Keyboard shortcuts (Antigravity-style):
   - CMD+Shift+M: Toggle Agent Manager
   - CMD+Shift+A: Create new agent
   - CMD+Shift+V: View all artifacts
   - CMD+Shift+B: Toggle browser panel
   - CMD+Shift+K: View knowledge base
   
3. Settings page:
   - Configure Ollama URL
   - Choose default model
   - Set approval thresholds
   - Enable/disable auto-verification
   
4. Onboarding:
   - First launch tutorial
   - Example tasks to try
   - Link to documentation
   
5. Error messages:
   - User-friendly
   - Actionable suggestions
   - Link to troubleshooting docs
   
6. Performance:
   - Lazy load artifacts
   - Paginate agent history
   - Optimize re-renders
   - Target 60fps UI
   
DELIVERABLE: Production-ready IDE with all features working
```

---

## PART 6: SUCCESS CRITERIA

Your IDE is complete when a user can:

1. ✅ Download and install (one-click installer)
2. ✅ Open IDE, sees familiar VSCode interface
3. ✅ Click "+ New Agent" button
4. ✅ Type: "Build a todo app with Next.js"
5. ✅ Agent creates implementation plan
6. ✅ User reviews plan, adds comment: "Use TypeScript"
7. ✅ Agent acknowledges comment, updates plan
8. ✅ User clicks "Approve"
9. ✅ Agent executes: scaffolds project, writes code, runs tests
10. ✅ Agent opens browser, tests app, records walkthrough
11. ✅ User sees artifacts: plan, diffs, screenshots, video
12. ✅ User clicks "Approve & Merge"
13. ✅ Code is committed, task marked complete
14. ✅ Agent added learnings to knowledge base
15. ✅ Everything happened in <5 minutes

**Bonus Goals:**

- Multiple agents running simultaneously
- Agent fixes errors automatically
- Browser tests prove app works
- Knowledge base gets smarter over time
- User trusts agent enough to leave it working async

---

## PART 7: WHAT MAKES THIS BETTER THAN CURSOR

| Feature         | Cursor          | Your IDE (Antigravity-style)          |
| --------------- | --------------- | ------------------------------------- |
| UI Paradigm     | Chat sidebar    | Agent Manager mission control         |
| Verification    | None            | Screenshots, recordings, walkthroughs |
| Artifacts       | Raw output      | Structured plans, tests, proofs       |
| Browser Testing | No              | Built-in Playwright integration       |
| Async Operation | Blocks UI       | Background agents                     |
| Multiple Agents | No              | Yes, orchestrate multiple             |
| Learning        | No              | Knowledge base improves over time     |
| Trust System    | Chat history    | Artifact-based verification           |
| Feedback        | Re-type request | Google Docs-style comments            |
| Model Choice    | Limited         | Any model (Ollama, Claude, GPT)       |

---

## FINAL NOTES

**This is the most comprehensive IDE build specification ever created.**

You now have:

- Complete architectural details
- Every UI component specified
- All workflows documented
- Implementation prompts for Jules
- Success criteria clearly defined

**Build this and you'll have an IDE that:**

- Matches Antigravity's innovation
- Runs 100% offline with Ollama
- Costs $0 to operate
- Is fully open source
- Developers will love
