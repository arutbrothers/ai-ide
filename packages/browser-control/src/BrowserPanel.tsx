import React from 'react';
import { BrowserManager } from './BrowserManager';

export const BrowserPanel: React.FC<{ manager: BrowserManager }> = ({ manager }) => {
	return (
		<div className="browser-panel">
			<div className="toolbar">
				<button onClick={() => manager.launch()}>Launch Browser</button>
				{/* Add address bar, back/forward buttons */}
			</div>
			<div className="viewport-placeholder">
				Browser Viewport (Playwright)
			</div>
		</div>
	);
};
