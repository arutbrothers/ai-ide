import React from 'react';
import { Agent } from '@ai-ide/agent-runtime';

interface AgentCardProps {
	agent: Agent;
	onSelect: () => void;
	onPause: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, onPause }) => {
	return (
		<div className="agent-card" onClick={onSelect} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
			<h3>{agent.config.name}</h3>
			<p>Status: {agent.state.status}</p>
			<button onClick={(e) => { e.stopPropagation(); onPause(); }}>
				{agent.state.status === 'executing' ? 'Pause' : 'Resume'}
			</button>
		</div>
	);
};
