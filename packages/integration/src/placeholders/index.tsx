import React from 'react';

export const Placeholder: React.FC<{ name: string }> = ({ name }) => (
    <div style={{
        padding: '20px',
        border: '2px dashed #ccc',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666'
    }}>
        <h3>{name}</h3>
        <p>Component implementation pending.</p>
    </div>
);
