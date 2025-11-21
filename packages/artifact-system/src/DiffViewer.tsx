import React from 'react';

interface DiffViewerProps {
	oldCode: string;
	newCode: string;
	language: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldCode, newCode, language }) => {
	// In a real implementation, we would use 'diff' package to compute changes
	// and render them with highlighting (green for add, red for remove).
	// For this scaffold, we'll show a split view.

	return (
		<div className="diff-viewer" style={{ display: 'flex', gap: '10px', fontFamily: 'monospace' }}>
			<div className="old-code" style={{ flex: 1, background: '#fdd' }}>
				<h4>Original</h4>
				<pre>{oldCode}</pre>
			</div>
			<div className="new-code" style={{ flex: 1, background: '#dfd' }}>
				<h4>Modified</h4>
				<pre>{newCode}</pre>
			</div>
		</div>
	);
};
