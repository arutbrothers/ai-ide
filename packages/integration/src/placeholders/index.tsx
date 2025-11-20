import React from 'react';

export const Placeholder = ({ title, shortcut }: { title: string, shortcut: string }) => (
    <div style={{ padding: 20, border: '1px dashed #ccc', height: '100%' }}>
        <h2>{title}</h2>
        <p>Press <code>{shortcut}</code> to toggle this view.</p>
        <p><em>Component not yet implemented in this build.</em></p>
    </div>
);

export const AgentManager = () => <Placeholder title="Agent Manager" shortcut="CMD+Shift+M" />;
export const ArtifactViewer = () => <Placeholder title="Artifact Viewer" shortcut="CMD+Shift+V" />;
export const BrowserPanel = () => <Placeholder title="Browser Panel" shortcut="CMD+Shift+B" />;
export const KnowledgeBase = () => <Placeholder title="Knowledge Base" shortcut="CMD+Shift+K" />;
export { CreateAgentModal } from './CreateAgentModal';
