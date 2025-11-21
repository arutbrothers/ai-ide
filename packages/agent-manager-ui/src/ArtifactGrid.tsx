import React from 'react';
import { Artifact } from '@ai-ide/artifact-system';

export const ArtifactGrid: React.FC<{ artifacts: Artifact[] }> = ({ artifacts }) => {
	return (
		<div className="artifact-grid">
			<h3>Artifacts</h3>
			<div className="grid">
				{artifacts.map(artifact => (
					<div key={artifact.id} className="artifact-thumbnail">
						<div className="preview">
							{/* Thumbnail preview based on type */}
							{artifact.type}
						</div>
						<div className="title">{artifact.title}</div>
					</div>
				))}
			</div>
		</div>
	);
};
