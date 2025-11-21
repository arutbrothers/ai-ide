// Artifact Detail Panel Client Script
(function () {
	const vscode = acquireVsCodeApi();

	let currentArtifact = null;

	// DOM elements
	const titleEl = document.getElementById('artifact-title');
	const typeEl = document.getElementById('artifact-type');
	const createdEl = document.getElementById('artifact-created');
	const agentEl = document.getElementById('artifact-agent');
	const idEl = document.getElementById('artifact-id');
	const contentEl = document.getElementById('content-display');
	const relatedFilesEl = document.getElementById('related-files');
	const copyBtn = document.getElementById('copy-btn');
	const downloadBtn = document.getElementById('download-btn');
	const deleteBtn = document.getElementById('delete-btn');

	// Event listeners
	copyBtn.addEventListener('click', () => {
		if (currentArtifact) {
			vscode.postMessage({
				command: 'copyContent',
				content: currentArtifact.content
			});
		}
	});

	downloadBtn.addEventListener('click', () => {
		if (currentArtifact) {
			vscode.postMessage({
				command: 'downloadArtifact',
				id: currentArtifact.id
			});
		}
	});

	deleteBtn.addEventListener('click', () => {
		if (currentArtifact) {
			vscode.postMessage({
				command: 'deleteArtifact',
				id: currentArtifact.id
			});
		}
	});

	// Handle messages from extension
	window.addEventListener('message', event => {
		const message = event.data;

		if (message.type === 'artifactLoaded') {
			currentArtifact = message.artifact;
			renderArtifact(message.artifact);
		}
	});

	function renderArtifact(artifact) {
		titleEl.textContent = `${artifact.type} Artifact`;
		typeEl.textContent = artifact.type;
		createdEl.textContent = new Date(artifact.createdAt).toLocaleString();
		agentEl.textContent = artifact.agentId || 'Unknown';
		idEl.textContent = artifact.id;

		// Render content with syntax highlighting based on type
		contentEl.textContent = artifact.content;
		contentEl.className = `language-${getLanguageForType(artifact.type)}`;

		// Render related files if any
		if (artifact.metadata?.files) {
			renderRelatedFiles(artifact.metadata.files);
		}
	}

	function getLanguageForType(type) {
		const typeMap = {
			'code': 'javascript',
			'plan': 'markdown',
			'verification': 'text',
			'screenshot': 'text',
			'diff': 'diff'
		};
		return typeMap[type] || 'text';
	}

	function renderRelatedFiles(files) {
		if (!files || files.length === 0) {
			relatedFilesEl.style.display = 'none';
			return;
		}

		relatedFilesEl.style.display = 'block';
		relatedFilesEl.innerHTML = `
			<h3>Related Files</h3>
			<ul class="file-list">
				${files.map(file => `
					<li class="file-item" data-path="${file}">
						<span class="file-icon">📄</span>
						<span class="file-path">${file}</span>
						<button class="open-file-btn" data-path="${file}">Open</button>
					</li>
				`).join('')}
			</ul>
		`;

		// Attach event listeners to open file buttons
		document.querySelectorAll('.open-file-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const path = e.target.getAttribute('data-path');
				vscode.postMessage({
					command: 'openFile',
					path
				});
			});
		});
	}
})();
