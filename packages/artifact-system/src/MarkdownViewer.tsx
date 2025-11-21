import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
	content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
	return (
		<div className="markdown-viewer" style={{
			padding: '20px',
			fontFamily: 'var(--vscode-font-family)',
			fontSize: '14px',
			lineHeight: '1.6'
		}}>
			<ReactMarkdown>{content}</ReactMarkdown>
		</div>
	);
};
