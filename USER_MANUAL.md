# AI IDE User Manual

## Introduction
Welcome to the AI IDE User Manual. This document provides comprehensive information about the new features and capabilities introduced in the latest version, specifically focusing on the BYOM (Bring Your Own Model) Adapter System and the enhanced Release Workflows.

## 1. BYOM (Bring Your Own Model) Adapter System

The AI IDE now features a robust modular architecture for managing Large Language Model (LLM) providers. This system, located in `packages/model-provider`, allows users to integrate various AI models seamlessly into their development workflow.

### Supported Adapters
The system supports multiple providers out of the box:

*   **Ollama**: For running local models.
*   **Anthropic (Claude)**: Integration with Anthropic's API.
*   **OpenAI (GPT)**: Integration with OpenAI's API.
*   **Hugging Face**: Connect to Hugging Face Inference Endpoints.
*   **Custom Adapter**: A flexible adapter that allows connection to any OpenAI-compatible API endpoint. This is ideal for connecting to local servers (like LM Studio, LocalAI) or other proprietary APIs that share the OpenAI interface.

### Key Features

#### Custom Adapter Configuration
The `CustomAdapter` is designed for flexibility. It can be configured with:
*   **Base URL**: The endpoint URL (e.g., `http://localhost:1234/v1` or a remote API).
*   **API Key**: Optional authentication key.
*   **Model Name**: The specific model identifier to request.

This allows you to "bring your own model" regardless of where it is hosted, as long as it speaks the standard chat completion protocol.

#### Advanced Strategies
The provider system is not just about single connections; it supports advanced orchestration strategies:

*   **Fallback**: Automatically switch to a backup provider if the primary one fails or is unavailable.
*   **Committee**: Query multiple models simultaneously and aggregate their responses for higher accuracy or consensus.
*   **Load Balancer**: Distribute requests across multiple providers to manage rate limits and performance.
*   **Token Routing**: Route requests to specific models based on the estimated token count (e.g., use a cheaper model for short queries and a more capable one for long contexts).

### Configuration
Providers are managed via the `AdapterRegistry`. By default, the system initializes adapters based on environment variables (e.g., `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) and defaults to **Ollama** for local execution.

## 2. Automated Release Workflows

We have significantly enhanced our Continuous Integration and Deployment (CI/CD) pipelines to ensure reliable and automated builds for major platforms.

### Release Build Pipeline
A new workflow has been introduced to automate the release process:

*   **Trigger**: The workflow is automatically triggered when changes are pushed to `release/*` branches.
*   **Platforms**:
    *   **Windows (x64)**: Builds the `User Setup` installer (`.exe`) and minified VS Code artifacts.
    *   **macOS (ARM64)**: Builds the application bundle for Apple Silicon (`.zip`). *Note: Currently configured for development builds without code signing certificates.*
*   **Artifacts**: Build artifacts are automatically uploaded to the workflow run, making it easy to test and distribute new versions immediately after a release branch update.

### CI Enhancements
*   **Node.js Compatibility**: The Windows build pipeline has been updated to use **Node.js v22**, ensuring compatibility with the latest dependencies and performance improvements.
*   **Performance**: `npm` dependency caching is enabled to significantly reduce build times.
*   **Clean Environment**: Unnecessary legacy workflows (e.g., specific PR checks for Mac/Windows) have been consolidated or removed to streamline the development process.

## 3. Initial AI IDE Setup

The `feat-initial-ai-ide-setup` introduces the core scaffolding for the AI-enhanced development environment.

*   **Modular Architecture**: The project is organized into packages (`packages/model-provider`, `packages/model-settings-ui`) to separate the AI backend logic from the UI components.
*   **Settings UI**: A dedicated React-based UI (`model-settings-ui`) is available for configuring model parameters, selecting active providers, and managing API keys directly within the IDE.

---
*This manual is based on the analysis of recent Git commits, including the implementation of the BYOM system and CI/CD workflow updates.*
