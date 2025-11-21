import React, { useState } from 'react';

interface JSONViewerProps {
	data: any;
	title?: string;
}

export const JSONViewer: React.FC<JSONViewerProps> = ({ data, title }) => {
	const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

	const toggleCollapse = (path: string) => {
		const newCollapsed = new Set(collapsed);
		if (newCollapsed.has(path)) {
			newCollapsed.delete(path);
		} else {
			newCollapsed.add(path);
		}
		setCollapsed(newCollapsed);
	};

	const renderValue = (value: any, path: string = '', depth: number = 0): React.ReactNode => {
		if (value === null) return <span className="json-null">null</span>;
		if (value === undefined) return <span className="json-undefined">undefined</span>;

		const type = typeof value;

		if (type === 'boolean') {
			return <span className="json-boolean">{String(value)}</span>;
		}

		if (type === 'number') {
			return <span className="json-number">{value}</span>;
		}

		if (type === 'string') {
			return <span className="json-string">"{value}"</span>;
		}

		if (Array.isArray(value)) {
			const isCollapsed = collapsed.has(path);
			return (
				<div className="json-array" style={{ marginLeft: depth * 20 }}>
					<span className="json-bracket" onClick={() => toggleCollapse(path)} style={{ cursor: 'pointer' }}>
						{isCollapsed ? '▶' : '▼'} [
					</span>
					{!isCollapsed && value.map((item, i) => (
						<div key={i} className="json-array-item">
							{renderValue(item, `${path}[${i}]`, depth + 1)}
							{i < value.length - 1 && ','}
						</div>
					))}
					<span className="json-bracket">]</span>
				</div>
			);
		}

		if (type === 'object') {
			const isCollapsed = collapsed.has(path);
			const keys = Object.keys(value);
			return (
				<div className="json-object" style={{ marginLeft: depth * 20 }}>
					<span className="json-bracket" onClick={() => toggleCollapse(path)} style={{ cursor: 'pointer' }}>
						{isCollapsed ? '▶' : '▼'} {'{'}
					</span>
					{!isCollapsed && keys.map((key, i) => (
						<div key={key} className="json-property">
							<span className="json-key">"{key}"</span>: {renderValue(value[key], `${path}.${key}`, depth + 1)}
							{i < keys.length - 1 && ','}
						</div>
					))}
					<span className="json-bracket">{'}'}</span>
				</div>
			);
		}

		return <span>{String(value)}</span>;
	};

	return (
		<div className="json-viewer" style={{
			padding: '20px',
			fontFamily: 'monospace',
			fontSize: '13px',
			background: 'var(--vscode-editor-background)',
			color: 'var(--vscode-editor-foreground)',
			overflow: 'auto'
		}}>
			{title && <h3 style={{ marginBottom: '10px' }}>{title}</h3>}
			{renderValue(data)}

			<style>{`
        .json-null { color: #808080; }
        .json-undefined { color: #808080; font-style: italic; }
        .json-boolean { color: #569cd6; }
        .json-number { color: #b5cea8; }
        .json-string { color: #ce9178; }
        .json-key { color: #9cdcfe; }
        .json-bracket { color: #ffd700; user-select: none; }
        .json-property { margin-left: 20px; }
        .json-array-item { margin-left: 20px; }
      `}</style>
		</div>
	);
};
