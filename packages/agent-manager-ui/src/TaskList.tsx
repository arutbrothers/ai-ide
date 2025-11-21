import React from 'react';
import { Task } from '@ai-ide/agent-runtime';

export const TaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
	return (
		<div className="task-list">
			<h3>Tasks</h3>
			<ul>
				{tasks.map(task => (
					<li key={task.id} className={`task ${task.status}`}>
						<span className="status-icon">{task.status}</span>
						{task.description}
					</li>
				))}
			</ul>
		</div>
	);
};
