import React, { useState } from 'react';

interface Props {
    providerId: string;
    initialConfig?: any;
    onSave: (config: any) => void;
    onClose: () => void;
}

export const ConfigureAdapterModal: React.FC<Props> = ({ providerId, initialConfig = {}, onSave, onClose }) => {
    const [apiKey, setApiKey] = useState(initialConfig.apiKey || '');
    const [baseURL, setBaseURL] = useState(initialConfig.baseURL || '');
    const [model, setModel] = useState(initialConfig.model || '');

    const handleSave = () => {
        onSave({
            apiKey: apiKey || undefined,
            baseURL: baseURL || undefined,
            model: model || undefined
        });
        onClose();
    };

    const isOllama = providerId === 'ollama';
    const isLocal = providerId === 'custom' || isOllama;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Configure {providerId}</h3>

                <div className="form-group">
                    <label>Model Name</label>
                    <input
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        placeholder={isOllama ? "codellama:7b" : "gpt-4"}
                    />
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
                    <button onClick={onClose}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};
