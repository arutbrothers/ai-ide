import React, { useState, useEffect } from 'react';
import { ShortcutManager } from './ShortcutManager';
import { SettingsPage } from './SettingsPage';
import { AgentManager, ArtifactViewer, BrowserPanel, KnowledgeBase, CreateAgentModal } from './placeholders';

export const App: React.FC = () => {
    const [view, setView] = useState<'none' | 'manager' | 'artifacts' | 'browser' | 'kb' | 'settings'>('none');
    const [showCreateAgent, setShowCreateAgent] = useState(false);

    useEffect(() => {
        const shortcuts = new ShortcutManager({
            'M': () => setView(v => v === 'manager' ? 'none' : 'manager'),
            'V': () => setView(v => v === 'artifacts' ? 'none' : 'artifacts'),
            'B': () => setView(v => v === 'browser' ? 'none' : 'browser'),
            'K': () => setView(v => v === 'kb' ? 'none' : 'kb'),
            ',': () => setView(v => v === 'settings' ? 'none' : 'settings'),
            'A': () => setShowCreateAgent(true),
        });
        shortcuts.mount();
        return () => shortcuts.unmount();
    }, []);

    return (
        <div className="app-container" style={{ display: 'flex', height: '100vh', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>
            <header style={{ background: '#252526', color: '#cccccc', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Antigravity AI IDE</div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowCreateAgent(true)} style={{ background: '#007acc', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 3 }}>+ New Agent (A)</button>
                    <button onClick={() => setView('manager')}>Mission Control (M)</button>
                    <button onClick={() => setView('artifacts')}>Artifacts (V)</button>
                    <button onClick={() => setView('browser')}>Browser (B)</button>
                    <button onClick={() => setView('kb')}>Knowledge (K)</button>
                    <button onClick={() => setView('settings')}>Settings</button>
                </div>
            </header>

            <main style={{ flex: 1, overflow: 'auto', position: 'relative', background: '#1e1e1e', color: '#d4d4d4' }}>
                {view === 'none' && (
                    <div style={{ padding: 60, textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
                        <h1 style={{ fontSize: '2.5em', marginBottom: 20 }}>Welcome to Antigravity</h1>
                        <p style={{ fontSize: '1.2em', color: '#aaa', marginBottom: 40 }}>
                            The agent-first IDE that builds software with you.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left' }}>
                            <div style={{ background: '#252526', padding: 20, borderRadius: 8, border: '1px solid #333' }}>
                                <h3 style={{ marginTop: 0 }}>🚀 Getting Started</h3>
                                <p>Press <strong>CMD+Shift+A</strong> to launch your first agent.</p>
                                <p>Try tasks like:</p>
                                <ul style={{ paddingLeft: 20 }}>
                                    <li>"Build a React todo app"</li>
                                    <li>"Refactor this component"</li>
                                    <li>"Write tests for my API"</li>
                                </ul>
                            </div>
                            <div style={{ background: '#252526', padding: 20, borderRadius: 8, border: '1px solid #333' }}>
                                <h3 style={{ marginTop: 0 }}>📚 Documentation</h3>
                                <ul style={{ paddingLeft: 20 }}>
                                    <li><a href="#" style={{ color: '#3794ff' }}>Quick Start Guide</a></li>
                                    <li><a href="#" style={{ color: '#3794ff' }}>Agent Workflow Patterns</a></li>
                                    <li><a href="#" style={{ color: '#3794ff' }}>Troubleshooting</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
                {view === 'manager' && <AgentManager />}
                {view === 'artifacts' && <ArtifactViewer />}
                {view === 'browser' && <BrowserPanel />}
                {view === 'kb' && <KnowledgeBase />}
                {view === 'settings' && <SettingsPage />}
            </main>

            {showCreateAgent && <CreateAgentModal onClose={() => setShowCreateAgent(false)} />}
        </div>
    );
};
