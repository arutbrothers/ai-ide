import React, { useState, useEffect } from 'react';
import { Agent } from '@ai-ide/agent-runtime';
import { AgentCard } from './AgentCard';
import { TaskList } from './TaskList';
import { ArtifactGrid } from './ArtifactGrid';

// Mock data for preview purposes if no real agents are passed
const MOCK_AGENTS: any[] = [];

export const ManagerView: React.FC = () => {
	const [agents, setAgents] = useState<Agent[]>([]);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

	// In a real app, we'd subscribe to agent state changes here
	useEffect(() => {
		// Simulate polling for updates
		const interval = setInterval(() => {
			// fetchAgents().then(setAgents);
		}, 1000);
		return () => clearInterval(interval);
	}, []);

	const handlePause = async (agent: Agent) => {
		if (agent.state.status === 'executing' || agent.state.status === 'planning') {
			await agent.pause();
		} else if (agent.state.status === 'paused') {
			await agent.resume();
		}
		// Force update UI
		setAgents([...agents]);
	};

	return (
		<div className="manager-view" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
			<header style={{ marginBottom: '20px', borderBottom: '1px solid #eee' }}>
				<h1>Agent Manager (Mission Control)</h1>
			</header>

			<div className="main-content" style={{ display: 'flex', gap: '20px' }}>
				<div className="agent-list" style={{ flex: 1 }}>
					<h2>Active Agents</h2>
					<div className="agent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
						{agents.length === 0 && <p>No active agents. Start one via the API.</p>}
						{agents.map(agent => (
							<AgentCard
								key={agent.id}
								agent={agent}
								onSelect={() => setSelectedAgent(agent)}
								onPause={() => handlePause(agent)}
							/>
						))}
					</div>
				</div>

				{selectedAgent && (
					<div className="agent-details" style={{ flex: 2, border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
							<h2>{selectedAgent.config.name}</h2>
							<button onClick={() => setSelectedAgent(null)}>Close</button>
						</div>

						<div className="status-bar">
							<strong>Status:</strong> {selectedAgent.state.status}
						</div>

						<div className="tasks-section" style={{ marginTop: '20px' }}>
							<TaskList tasks={selectedAgent.state.tasks} />
						</div>

						<div className="artifacts-section" style={{ marginTop: '20px' }}>
							<ArtifactGrid artifacts={[]} />
							{/* In real app, we'd fetch artifacts for this agent */}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
