import React, { useState } from 'react';
import { ModelSettings, ConfigureAdapterModal, ModelMetricsPanel } from '@ai-ide/model-settings-ui';
import { registry, metricsCollector, ConfigManager } from '@ai-ide/model-provider';

export const SettingsPage: React.FC = () => {
    const [configureId, setConfigureId] = useState<string | null>(null);
    const configManager = new ConfigManager(); // Use default path

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

    return (
        <div className="settings-page" style={{ padding: 20 }}>
            <h1>Settings</h1>

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
