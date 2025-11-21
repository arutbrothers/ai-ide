import React, { useState } from 'react';
import { KnowledgeStore } from './KnowledgeStore';
import { KnowledgeItem } from './types';

export const KnowledgeBaseUI: React.FC<{ store: KnowledgeStore }> = ({ store }) => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<KnowledgeItem[]>([]);

	const handleSearch = async () => {
		const items = await store.search(query);
		setResults(items);
	};

	return (
		<div className="knowledge-base-ui">
			<input
				value={query}
				onChange={e => setQuery(e.target.value)}
				placeholder="Search knowledge..."
			/>
			<button onClick={handleSearch}>Search</button>

			<div className="results">
				{results.map(item => (
					<div key={item.id} className="knowledge-item">
						<h4>{item.title}</h4>
						<p>{item.type}</p>
					</div>
				))}
			</div>
		</div>
	);
};
