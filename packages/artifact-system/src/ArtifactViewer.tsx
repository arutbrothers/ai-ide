import React from 'react';
import { Artifact, Comment } from './types';
import { MarkdownViewer } from './MarkdownViewer';
import { VideoPlayer } from './VideoPlayer';
import { JSONViewer } from './JSONViewer';
import { DiffViewer } from './DiffViewer';

interface ArtifactViewerProps {
	artifact: Artifact;
	comments: Comment[];
	onAddComment: (content: string) => void;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifact, comments, onAddComment }) => {
	const renderContent = () => {
		switch (artifact.type) {
			case 'implementation_plan':
				return <MarkdownViewer content={artifact.content} />;

			case 'task_list':
				return <JSONViewer data={artifact.content} title="Task List" />;

			case 'test_result':
				return <JSONViewer data={artifact.content} title="Test Results" />;

			case 'screenshot':
				return (
					<div style={{ padding: '20px' }}>
						<img
							src={artifact.content.path}
							alt={artifact.title}
							style={{ maxWidth: '100%', border: '1px solid #ccc' }}
						/>
					</div>
				);

			case 'walkthrough_recording':
				return <VideoPlayer src={artifact.content.path} title={artifact.title} />;

			case 'code_diff':
				return <DiffViewer
					oldCode={artifact.content.oldCode || ''}
					newCode={artifact.content.newCode || artifact.content.diff || ''}
					language="typescript"
				/>;

			default:
				return <pre>{JSON.stringify(artifact.content, null, 2)}</pre>;
		}
	};

	return (
		<div className="artifact-viewer">
			<div className="artifact-header">
				<h2>{artifact.title}</h2>
				<span className="type-badge">{artifact.type}</span>
			</div>

			<div className="artifact-content">
				{renderContent()}
			</div>

			<div className="comments-section">
				<h3>Comments</h3>
				{comments.map(c => (
					<div key={c.id} className="comment">
						<strong>{c.userId}:</strong> {c.content}
					</div>
				))}
				<button onClick={() => onAddComment('New comment')}>Add Comment</button>
			</div>
		</div>
	);
};
