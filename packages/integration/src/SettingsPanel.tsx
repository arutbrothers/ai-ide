import React, { useState, useEffect } from 'react';

interface Settings {
	ollamaUrl: string;
	defaultModel: string;
	autoApprove: boolean;
	maxConcurrentAgents: number;
	enableAutoVerification: boolean;
}

export const SettingsPanel: React.FC = () => {
	const [settings, setSettings] = useState<Settings>({
		ollamaUrl: 'http://localhost:11434',
		defaultModel: 'ollama',
		autoApprove: false,
		maxConcurrentAgents: 2,
		enableAutoVerification: true
	});

	const [apiKeys, setApiKeys] = useState({
		anthropic: '',
		openai: ''
	});

	const handleSave = () => {
		// Save to VSCode settings
		console.log('Saving settings:', settings);
		// In real implementation: vscode.workspace.getConfiguration('aiide').update(...)
	};

	return (
		<div style={{ padding: '20px', fontFamily: 'var(--vscode-font-family)' }}>
			<h1>AI IDE Settings</h1>

			<section style={{ marginBottom: '30px' }}>
				<h2>Model Configuration</h2>

				<div style={{ marginBottom: '15px' }}>
					<label>
						<strong>Ollama URL:</strong>
						<input
							type="text"
							value={settings.ollamaUrl}
							onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
							style={{ width: '100%', padding: '8px', marginTop: '5px' }}
						/>
					</label>
				</div>

				<div style={{ marginBottom: '15px' }}>
					<label>
						<strong>Default Model:</strong>
						<select
							value={settings.defaultModel}
							onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
							style={{ width: '100%', padding: '8px', marginTop: '5px' }}
						>
							<option value="ollama">Ollama (Local)</option>
							<option value="anthropic">Claude (Anthropic)</option>
							<option value="openai">GPT (OpenAI)</option>
							<option value="custom">Custom Endpoint</option>
						</select>
					</label>
				</div>
			</section>

			<section style={{ marginBottom: '30px' }}>
				<h2>API Keys</h2>

				<div style={{ marginBottom: '15px' }}>
					<label>
						<strong>Anthropic API Key:</strong>
						<input
							type="password"
							value={apiKeys.anthropic}
							onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
							placeholder="sk-ant-..."
							style={{ width: '100%', padding: '8px', marginTop: '5px' }}
						/>
					</label>
				</div>

				<div style={{ marginBottom: '15px' }}>
					<label>
						<strong>OpenAI API Key:</strong>
						<input
							type="password"
							value={apiKeys.openai}
							onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
							placeholder="sk-..."
							style={{ width: '100%', padding: '8px', marginTop: '5px' }}
						/>
					</label>
				</div>
			</section>

			<section style={{ marginBottom: '30px' }}>
				<h2>Agent Behavior</h2>

				<div style={{ marginBottom: '15px' }}>
					<label>
						<input
							type="checkbox"
							checked={settings.autoApprove}
							onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
						/>
						{' '}Auto-approve agent plans (skip manual approval)
					</label>
				</div>

				<div style={{ marginBottom: '15px' }}>
					<label>
						<input
							type="checkbox"
							checked={settings.enableAutoVerification}
							onChange={(e) => setSettings({ ...settings, enableAutoVerification: e.target.checked })}
						/>
						{' '}Enable automatic browser verification
					</label>
				</div>

				<div style={{ marginBottom: '15px' }}>
					<label>
						<strong>Max Concurrent Agents:</strong>
						<input
							type="number"
							min="1"
							max="10"
							value={settings.maxConcurrentAgents}
							onChange={(e) => setSettings({ ...settings, maxConcurrentAgents: parseInt(e.target.value) })}
							style={{ width: '100px', padding: '8px', marginTop: '5px', marginLeft: '10px' }}
						/>
					</label>
				</div>
			</section>

			<section>
				<button
					onClick={handleSave}
					style={{
						padding: '10px 20px',
						background: 'var(--vscode-button-background)',
						color: 'var(--vscode-button-foreground)',
						border: 'none',
						cursor: 'pointer',
						borderRadius: '2px'
					}}
				>
					Save Settings
				</button>
			</section>
		</div>
	);
};
