// Browser panel client-side script
(function () {
	const vscode = acquireVsCodeApi();

	let manualControlEnabled = false;
	let actionLog = [];
	let screenshots = [];

	// DOM elements
	const urlBar = document.getElementById('url-bar');
	const navigateBtn = document.getElementById('navigate-btn');
	const screenshotBtn = document.getElementById('screenshot-btn');
	const manualControlCheckbox = document.getElementById('manual-control');
	const browserFrame = document.getElementById('browser-frame');
	const actionList = document.getElementById('action-list');
	const screenshotList = document.getElementById('screenshot-list');

	// Event listeners
	navigateBtn.addEventListener('click', () => {
		const url = urlBar.value;
		if (url) {
			vscode.postMessage({
				command: 'navigate',
				url: url
			});
			addActionLog('navigate', `Navigating to ${url}`);
		}
	});

	urlBar.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			navigateBtn.click();
		}
	});

	screenshotBtn.addEventListener('click', () => {
		vscode.postMessage({
			command: 'screenshot'
		});
		addActionLog('screenshot', 'Taking screenshot');
	});

	manualControlCheckbox.addEventListener('change', (e) => {
		manualControlEnabled = e.target.checked;
		vscode.postMessage({
			command: 'toggleManualControl',
			enabled: manualControlEnabled
		});
	});

	// Handle messages from extension
	window.addEventListener('message', event => {
		const message = event.data;

		switch (message.type) {
			case 'cdpConnected':
				console.log('CDP connected:', message.url);
				// Could embed DevTools here if needed
				break;

			case 'navigationComplete':
				urlBar.value = message.url;
				browserFrame.src = message.url;
				addActionLog('navigate', `Loaded ${message.url}`, 'success');
				break;

			case 'actionComplete':
				addActionLog(
					message.action,
					`${message.action} on ${message.selector}`,
					'success'
				);
				break;

			case 'screenshot':
				addScreenshot(message.data);
				break;

			case 'manualControlToggled':
				manualControlEnabled = message.enabled;
				updateManualControlUI();
				break;
		}
	});

	function addActionLog(action, description, status = 'pending') {
		const logEntry = {
			timestamp: new Date().toISOString(),
			action,
			description,
			status
		};

		actionLog.unshift(logEntry);

		// Keep only last 50 actions
		if (actionLog.length > 50) {
			actionLog = actionLog.slice(0, 50);
		}

		renderActionLog();
	}

	function renderActionLog() {
		actionList.innerHTML = actionLog.map(entry => `
			<div class="action-entry ${entry.status}">
				<span class="action-time">${new Date(entry.timestamp).toLocaleTimeString()}</span>
				<span class="action-type">${entry.action}</span>
				<span class="action-desc">${entry.description}</span>
			</div>
		`).join('');
	}

	function addScreenshot(base64Data) {
		const screenshot = {
			timestamp: new Date().toISOString(),
			data: base64Data,
			url: urlBar.value
		};

		screenshots.unshift(screenshot);

		// Keep only last 20 screenshots
		if (screenshots.length > 20) {
			screenshots = screenshots.slice(0, 20);
		}

		renderScreenshots();
	}

	function renderScreenshots() {
		screenshotList.innerHTML = screenshots.map((shot, index) => `
			<div class="screenshot-item">
				<img src="data:image/png;base64,${shot.data}" alt="Screenshot ${index}" />
				<div class="screenshot-info">
					<div class="screenshot-time">${new Date(shot.timestamp).toLocaleString()}</div>
					<div class="screenshot-url">${shot.url}</div>
				</div>
			</div>
		`).join('');
	}

	function updateManualControlUI() {
		document.body.classList.toggle('manual-control', manualControlEnabled);

		if (manualControlEnabled) {
			addActionLog('system', 'Manual control enabled', 'info');
		} else {
			addActionLog('system', 'Agent control enabled', 'info');
		}
	}

	// Initialize
	console.log('Browser panel initialized');
})();
