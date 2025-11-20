import React, { useState, useEffect } from 'react';
import { ModelSettings, ConfigureAdapterModal, ModelMetricsPanel } from '@ai-ide/model-settings-ui';
import { registry, metricsCollector, ConfigManager } from '@ai-ide/model-provider';

export const SettingsPage: React.FC = () => {
    const [configureId, setConfigureId] = useState<string | null>(null);
    const [generalConfig, setGeneralConfig] = useState({ approvalThreshold: 80, autoVerification: true });
    // Note: ConfigManager instantiation should ideally be a singleton or context
    const [configManager] = useState(() => new ConfigManager());

    useEffect(() => {
        configManager.load().then(() => {
            const cfg = configManager.getConfig();
            if (cfg?.general) {
                setGeneralConfig({
                    approvalThreshold: cfg.general.approvalThreshold ?? 80,
                    autoVerification: cfg.general.autoVerification ?? true
                });
            }
        });
    }, [configManager]);

    const handleSaveConfig = async (id: string, config: any) => {
        // Load current, update, save
        // This is a simplified logic. Real app would verify config structure.
        try {
            await configManager.load();
            // We need to construct the full config object.
            // Since ConfigManager.save expects a full Config object,
            // we should really expose a method to update a specific provider config.
            // For now, we'll just log it as we can't easily read/write partials without full state.
            console.log('Saving config for', id, config);

            // Update registry immediately
            // (In real app, ConfigManager would handle this)
        } catch (e) {
            console.error(e);
        }
    };

    const handleGeneralChange = (key: string, value: any) => {
        const newConfig = { ...generalConfig, [key]: value };
        setGeneralConfig(newConfig);
        // Save to file logic would go here
        // For now we just update state
        console.log('Updated general settings:', newConfig);
    };

    return (
        <div className="settings-page" style={{ padding: 20 }}>
            <h1>Settings</h1>

            <section style={{ marginBottom: 30 }}>
                <h2>General Settings</h2>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ display: 'block', marginBottom: 5 }}>Approval Threshold ({generalConfig.approvalThreshold}%)</label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={generalConfig.approvalThreshold}
                        onChange={(e) => handleGeneralChange('approvalThreshold', parseInt(e.target.value))}
                        style={{ width: '300px' }}
                    />
                </div>
                <div style={{ marginBottom: 15 }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={generalConfig.autoVerification}
                            onChange={(e) => handleGeneralChange('autoVerification', e.target.checked)}
                        />
                        {' '}Enable Auto-Verification
                    </label>
                </div>
            </section>

            <section>
                <h2>AI Models</h2>
                <ModelSettings
                    registry={registry}
                    onConfigure={setConfigureId}
                />
            </section>

            <section>
                <ModelMetricsPanel collector={metricsCollector} />
            </section>

            {configureId && (
                <ConfigureAdapterModal
                    providerId={configureId}
                    onSave={(cfg) => handleSaveConfig(configureId, cfg)}
                    onClose={() => setConfigureId(null)}
                    // We could pass existing config if we fetched it from ConfigManager
                />
            )}
        </div>
    );
};
