import React, { useState, useEffect } from 'react';
import { AdapterRegistry, ModelProviderInfo, ModelProvider } from '@ai-ide/model-provider';

interface Props {
    registry: AdapterRegistry;
    value: { providerId: string; model: string };
    onChange: (value: { providerId: string; model: string }) => void;
}

export const AgentModelSelector: React.FC<Props> = ({ registry, value, onChange }) => {
    const [providers, setProviders] = useState<ModelProviderInfo[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [loadingModels, setLoadingModels] = useState(false);

    useEffect(() => {
        const load = async () => {
            const list = await registry.list();
            // Only show available providers
            const available = list.filter(p => p.available);
            setProviders(available);

            // Use default if value not set
            if (!value.providerId && available.length > 0) {
                try {
                    const def = registry.getDefault();
                    // Find the ID for this instance
                    // This is tricky as registry.getDefault() returns instance without ID property attached
                    // (unless I change ModelProvider to include ID, which I didn't).
                    // But I can match by name or just pick the first available.
                    const defInfo = available.find(p => p.name === def.name) || available[0];
                    onChange({ providerId: defInfo.id, model: '' });
                } catch {
                     onChange({ providerId: available[0].id, model: '' });
                }
            }
        };
        load();
    }, [registry]);

    useEffect(() => {
        const loadModels = async () => {
            if (!value.providerId) return;

            const provider = registry.get(value.providerId);
            if (provider && provider.listModels) {
                setLoadingModels(true);
                try {
                    const list = await provider.listModels();
                    setModels(list);
                    // If current model not in list (and list not empty), select first
                    if (list.length > 0 && !list.includes(value.model) && !value.model) {
                        onChange({ ...value, model: list[0] });
                    }
                } catch (e) {
                    console.warn('Failed to list models', e);
                    setModels([]);
                } finally {
                    setLoadingModels(false);
                }
            } else {
                setModels([]);
            }
        };
        loadModels();
    }, [registry, value.providerId]);

    return (
        <div className="agent-model-selector">
            <div className="form-group">
                <label>Provider</label>
                <select
                    value={value.providerId}
                    onChange={e => onChange({ providerId: e.target.value, model: '' })}
                >
                    {providers.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({p.type})
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label>Model</label>
                {loadingModels ? (
                    <span>Loading models...</span>
                ) : models.length > 0 ? (
                    <select
                        value={value.model}
                        onChange={e => onChange({ ...value, model: e.target.value })}
                    >
                        {models.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        value={value.model}
                        onChange={e => onChange({ ...value, model: e.target.value })}
                        placeholder="Model name (e.g. gpt-4)"
                    />
                )}
            </div>
        </div>
    );
};
