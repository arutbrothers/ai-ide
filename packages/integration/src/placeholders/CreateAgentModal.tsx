import React from 'react';

export const CreateAgentModal = ({ onClose }: { onClose: () => void }) => (
    <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
        <div style={{ background: '#fff', padding: 20, borderRadius: 5, width: 400, color: '#000' }}>
            <h2>Create New Agent</h2>
            <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Agent Name</label>
                <input type="text" placeholder="e.g. Feature Builder" style={{ width: '100%', padding: 8 }} />
            </div>
            <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', marginBottom: 5 }}>Task Description</label>
                <textarea placeholder="Describe what the agent should do..." style={{ width: '100%', height: 100, padding: 8 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={onClose} style={{ padding: '8px 16px' }}>Cancel</button>
                <button onClick={onClose} style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none' }}>Create Agent</button>
            </div>
        </div>
    </div>
);
