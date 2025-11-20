import React, { useState, useEffect } from 'react';
import { ShortcutManager } from './ShortcutManager';
import { SettingsPage } from './SettingsPage';
import { AgentManager, ArtifactViewer, BrowserPanel, KnowledgeBase } from './placeholders';

export const App: React.FC = () => {
    const [view, setView] = useState<'none' | 'manager' | 'artifacts' | 'browser' | 'kb' | 'settings'>('none');

    useEffect(() => {
        const shortcuts = new ShortcutManager({
            'M': () => setView(v => v === 'manager' ? 'none' : 'manager'),
            'V': () => setView(v => v === 'artifacts' ? 'none' : 'artifacts'),
            'B': () => setView(v => v === 'browser' ? 'none' : 'browser'),
            'K': () => setView(v => v === 'kb' ? 'none' : 'kb'),
            ',': () => setView(v => v === 'settings' ? 'none' : 'settings'), // CMD+Shift+, is weird, but let's use it or just assume UI toggle
        });
        shortcuts.mount();
        return () => shortcuts.unmount();
    }, []);

    return (
        <div className="app-container" style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
            <header style={{ background: '#333', color: '#fff', padding: 10, display: 'flex', justifyContent: 'space-between' }}>
                <div>Antigravity AI IDE</div>
                <div>
                    <button onClick={() => setView('manager')}>Agents (M)</button>
                    <button onClick={() => setView('artifacts')}>Artifacts (V)</button>
                    <button onClick={() => setView('browser')}>Browser (B)</button>
                    <button onClick={() => setView('kb')}>Knowledge (K)</button>
                    <button onClick={() => setView('settings')}>Settings</button>
                </div>
            </header>

            <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {view === 'none' && (
                    <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>
                        <h1>Welcome to Antigravity AI IDE</h1>
                        <p>Use CMD+Shift+A to create a new agent.</p>
                        <p>Use the toolbar or shortcuts to navigate.</p>
                    </div>
                )}
                {view === 'manager' && <AgentManager />}
                {view === 'artifacts' && <ArtifactViewer />}
                {view === 'browser' && <BrowserPanel />}
                {view === 'kb' && <KnowledgeBase />}
                {view === 'settings' && <SettingsPage />}
            </main>
        </div>
    );
};
