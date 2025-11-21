# AI IDE User Manual

## Introduction
Welcome to the AI IDE User Manual. This document details the features of the Antigravity-Inspired AI IDE, a revolutionary development environment designed to prioritize trust, autonomy, feedback, and self-improvement.

## 1. Agent Manager (Mission Control)

The **Agent Manager** is the central hub for orchestrating AI agents. Unlike traditional "chat sidebar" interfaces, this "Mission Control" view allows you to manage autonomous agents as they execute complex tasks.

### Key Capabilities
*   **Agent Monitoring**: View active agents, their current status (e.g., "Executing", "Planning"), and detailed progress lists.
*   **Control**: Pause, resume, or cancel agent execution at any time.
*   **Task Visualization**: Expand agent cards to see the specific steps (research, implementation, verification) being undertaken.
*   **Access**: Toggle the view using the command `CMD+Shift+M`.

## 2. Artifact-Based Verification

The IDE moves beyond simple text output to **Structured Artifacts**. Agents produce verifiable deliverables that establish trust.

### Artifact Types
*   **Implementation Plans**: Detailed markdown documents outlining the strategy before code is written.
*   **Task Lists**: Dynamic lists tracking the status of individual sub-tasks.
*   **Screenshots**: Visual proof of UI states captured during verification.
*   **Recordings**: Video walkthroughs (15-30s) demonstrating the functionality of the built feature.
*   **Code Diffs**: Standardized diffs showing exactly what changed in the codebase.
*   **Test Results**: JSON reports confirming that the code passes all unit and integration tests.

## 3. Integrated Browser (Verification Surface)

The IDE includes a fully embedded **Chromium-based Browser** that agents can control programmatically. This serves as the primary surface for verification.

### Features
*   **Agent Control**: Agents can navigate, click, type, and interact with your web application to test functionality.
*   **Visual Capture**: The browser supports automated screenshotting and video recording of sessions.
*   **Manual Override**: Users can take control of the browser manually when needed.
*   **Action Logs**: A real-time log showing every action (click, type, navigate) performed by the agent.
*   **Access**: Open the browser panel using the command `CMD+Shift+B`.

## 4. BYOM (Bring Your Own Model) Adapter System

The **BYOM System** ensures no vendor lock-in by allowing you to connect any LLM provider to the IDE.

### Supported Adapters
*   **Ollama**: Primary support for offline, local models (e.g., Llama 3, DeepSeek Coder). Cost-effective and private.
*   **Anthropic**: Direct integration with Claude models (Sonnet 3.5, Opus) for high-complexity reasoning.
*   **OpenAI**: Support for GPT-4o and other OpenAI models.
*   **Hugging Face**: Run lightweight models directly via `transformers.js`.
*   **Custom Adapter**: Connect to any OpenAI-compatible API endpoint (e.g., LM Studio, LocalAI, corporate gateways).

### Advanced Configuration
*   **Strategies**: Configure fallback (local → API), committee (multi-model consensus), and load balancing.
*   **Metrics**: Track token usage, latency, and success rates per provider.

## 5. Knowledge Base (Self-Improvement)

The **Knowledge Base** allows the IDE to learn from your project and past successes.

### Functionality
*   **Pattern Extraction**: The system analyzes successful tasks to extract reusable code patterns and snippets.
*   **Semantic Search**: Agents automatically search the knowledge base for relevant context before starting new tasks.
*   **Management**: Browse, add, and manage knowledge items via the dedicated view (`CMD+Shift+K`).
*   **Storage**: Efficient local storage using LevelDB with vector embeddings for retrieval.

## 6. Automated Release Workflows

The IDE includes pre-configured CI/CD pipelines to automate the build and release process.

*   **Trigger**: Pushing to `release/*` branches triggers a full build.
*   **Windows Build**: Produces `User Setup` installers (`.exe`) using Node.js v22.
*   **macOS Build**: Cross-compiles macOS ARM64 bundles (`.zip`) using a Dockerized environment.
*   **Artifacts**: Build outputs are automatically attached to the GitHub Action run.

## 7. Initial Setup & Onboarding

The IDE comes pre-configured with the core scaffolding needed for AI-enhanced development:
*   **Modular Architecture**: Clear separation between the Agent Runtime (`packages/agent-runtime`), UI (`packages/model-settings-ui`), and Extensions.
*   **Settings UI**: Dedicated interface for configuring model providers and IDE preferences.

---
*This manual aligns with the "Antigravity-Inspired" build specification, covering all major surfaces (Manager, Editor, Browser) and systems (Artifacts, Knowledge Base, BYOM).*
