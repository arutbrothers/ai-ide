import React, { useState } from 'react';

interface Props {
    providerId: string;
    initialConfig?: any;
    availableModels?: string[];
    onSave: (config: any) => void;
    onTest?: (config: any) => Promise<void>;
    onClose: () => void;
}

export const ConfigureAdapterModal: React.FC<Props> = ({ providerId, initialConfig = {}, availableModels, onSave, onTest, onClose }) => {
    const [apiKey, setApiKey] = useState(initialConfig.apiKey || '');
    const [baseURL, setBaseURL] = useState(initialConfig.baseURL || '');
    const [model, setModel] = useState(initialConfig.model || '');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const getConfig = () => ({
        apiKey: apiKey || undefined,
        baseURL: baseURL || undefined,
        model: model || undefined
    });

    const handleSave = () => {
        onSave(getConfig());
        onClose();
    };

    const handleTest = async () => {
        if (!onTest) return;
        setTesting(true);
        setTestResult(null);
        try {
            await onTest(getConfig());
            setTestResult({ success: true, message: 'Connection successful!' });
        } catch (e) {
            setTestResult({ success: false, message: (e as Error).message });
        } finally {
            setTesting(false);
        }
    };

    const isOllama = providerId === 'ollama';
    const isLocal = providerId === 'custom' || isOllama;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Configure {providerId}</h3>

                <div className="form-group">
                    <label>Model Name</label>
                    {availableModels && availableModels.length > 0 ? (
                        <select value={model} onChange={e => setModel(e.target.value)}>
                            <option value="">Select a model...</option>
                            {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    ) : (
                        <input
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            placeholder={isOllama ? "codellama:7b" : "gpt-4"}
                        />
                    )}
                </div>

                {isLocal && (
                    <div className="form-group">
                        <label>Base URL</label>
                        <input
                            value={baseURL}
                            onChange={e => setBaseURL(e.target.value)}
                            placeholder="http://localhost:11434"
                        />
                    </div>
                )}

                {!isOllama && (
                    <div className="form-group">
                        <label>API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={e => setApiKey(e.target.value)}
                        />
                    </div>
                )}

                <div className="actions">
                    {onTest && (
                        <button onClick={handleTest} disabled={testing}>
                            {testing ? 'Testing...' : 'Test Connection'}
                        </button>
                    )}
                    <div className="right-actions">
                        <button onClick={onClose}>Cancel</button>
                        <button onClick={handleSave}>Save</button>
                    </div>
                </div>

                {testResult && (
                    <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                        {testResult.message}
                    </div>
                )}
            </div>
        </div>
    );
};
