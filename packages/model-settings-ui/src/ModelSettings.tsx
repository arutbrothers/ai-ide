import React, { useState, useEffect } from 'react';
import { AdapterRegistry, ModelProviderInfo } from '@ai-ide/model-provider';

interface Props {
    registry: AdapterRegistry;
    onConfigure: (id: string) => void;
}

export const ModelSettings: React.FC<Props> = ({ registry, onConfigure }) => {
    const [providers, setProviders] = useState<ModelProviderInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [defaultId, setDefaultId] = useState<string>('ollama');

    const loadProviders = async () => {
        setLoading(true);
        try {
            const list = await registry.list();
            setProviders(list);
            try {
                const def = registry.getDefault();
                // ID isn't directly exposed on instance easily without searching,
                // but let's assume we can match by name or manage state externally.
                // For now, we'll just trust the list.
                // Actually registry.getDefault() returns the provider instance.
                // We need the ID. The registry stores it.
                // Let's assume we manage default ID in this component or fetch it if registry exposes it.
                // Registry doesn't expose 'getDefaultId', only 'getDefault'.
                // I'll add 'getDefaultId' to registry later, for now I'll skip syncing default ID from registry
                // and just allow setting it.
            } catch (e) {
                // no default set
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProviders();
    }, [registry]);

    const handleSetDefault = (id: string) => {
        try {
            registry.setDefault(id);
            setDefaultId(id);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="model-settings">
            <div className="header">
                <h2>Model Providers</h2>
                <button onClick={loadProviders} disabled={loading}>Refresh</button>
            </div>

            <div className="provider-list">
                {providers.map(provider => (
                    <div key={provider.id} className="provider-card">
                        <div className="provider-info">
                            <h3>{provider.name}</h3>
                            <span className={`badge ${provider.type}`}>{provider.type}</span>
                            <span className={`badge ${provider.available ? 'available' : 'unavailable'}`}>
                                {provider.available ? '✓ Available' : '✗ Unavailable'}
                            </span>
                        </div>

                        <div className="provider-actions">
                            <button onClick={() => onConfigure(provider.id)}>Configure</button>
                            <button
                                disabled={defaultId === provider.id || !provider.available}
                                onClick={() => handleSetDefault(provider.id)}
                            >
                                {defaultId === provider.id ? 'Default' : 'Set Default'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
