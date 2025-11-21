// Knowledge Base Panel Client Script
(function () {
	const vscode = acquireVsCodeApi();

	let currentKnowledge = [];
	let editingId = null;

	// DOM elements
	const searchInput = document.getElementById('search-input');
	const searchBtn = document.getElementById('search-btn');
	const addBtn = document.getElementById('add-btn');
	const knowledgeList = document.getElementById('knowledge-list');
	const statsDiv = document.getElementById('stats');
	const editModal = document.getElementById('edit-modal');
	const modalTitle = document.getElementById('modal-title');
	const knowledgeForm = document.getElementById('knowledge-form');
	const typeSelect = document.getElementById('type-select');
	const contentInput = document.getElementById('content-input');
	const tagsInput = document.getElementById('tags-input');
	const cancelBtn = document.getElementById('cancel-btn');

	// Event listeners
	searchBtn.addEventListener('click', () => {
		const query = searchInput.value.trim();
		vscode.postMessage({
			command: 'search',
			query
		});
	});

	searchInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			searchBtn.click();
		}
	});

	addBtn.addEventListener('click', () => {
		openModal();
	});

	cancelBtn.addEventListener('click', () => {
		closeModal();
	});

	knowledgeForm.addEventListener('submit', (e) => {
		e.preventDefault();
		saveKnowledge();
	});

	// Handle messages from extension
	window.addEventListener('message', event => {
		const message = event.data;

		switch (message.type) {
			case 'allKnowledge':
				currentKnowledge = message.items;
				renderKnowledgeList(message.items);
				break;

			case 'searchResults':
				renderKnowledgeList(message.results);
				break;

			case 'stats':
				renderStats(message.stats);
				break;
		}
	});

	function renderKnowledgeList(items) {
		if (items.length === 0) {
			knowledgeList.innerHTML = '<div class="empty-state">No knowledge items found</div>';
			return;
		}

		knowledgeList.innerHTML = items.map(item => `
			<div class="kb-item" data-id="${item.id}">
				<div class="kb-item-header">
					<span class="kb-type kb-type-${item.type}">${item.type}</span>
					<span class="kb-timestamp">${formatTimestamp(item.timestamp)}</span>
				</div>
				<div class="kb-content">${escapeHtml(item.content.substring(0, 200))}${item.content.length > 200 ? '...' : ''}</div>
				<div class="kb-metadata">
					${item.metadata?.tags ? item.metadata.tags.map(tag =>
			`<span class="kb-tag">${tag}</span>`
		).join('') : ''}
				</div>
				<div class="kb-actions">
					<button class="edit-btn" data-id="${item.id}">Edit</button>
					<button class="delete-btn" data-id="${item.id}">Delete</button>
				</div>
			</div>
		`).join('');

		// Attach event listeners
		document.querySelectorAll('.edit-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const id = e.target.getAttribute('data-id');
				editKnowledge(id);
			});
		});

		document.querySelectorAll('.delete-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const id = e.target.getAttribute('data-id');
				deleteKnowledge(id);
			});
		});
	}

	function renderStats(stats) {
		const typeBreakdown = Object.entries(stats.byType)
			.map(([type, count]) => `${type}: ${count}`)
			.join(' | ');

		statsDiv.innerHTML = `
			<div class="stat-item">
				<strong>Total:</strong> ${stats.total}
			</div>
			<div class="stat-item">
				${typeBreakdown}
			</div>
		`;
	}

	function openModal(item = null) {
		if (item) {
			editingId = item.id;
			modalTitle.textContent = 'Edit Knowledge';
			typeSelect.value = item.type;
			contentInput.value = item.content;
			tagsInput.value = item.metadata?.tags?.join(', ') || '';
		} else {
			editingId = null;
			modalTitle.textContent = 'Add Knowledge';
			knowledgeForm.reset();
		}

		editModal.style.display = 'flex';
	}

	function closeModal() {
		editModal.style.display = 'none';
		knowledgeForm.reset();
		editingId = null;
	}

	function saveKnowledge() {
		const data = {
			type: typeSelect.value,
			content: contentInput.value.trim(),
			metadata: {
				tags: tagsInput.value.split(',').map(t => t.trim()).filter(t => t),
				timestamp: new Date().toISOString()
			}
		};

		if (editingId) {
			vscode.postMessage({
				command: 'edit',
				id: editingId,
				data
			});
		} else {
			vscode.postMessage({
				command: 'add',
				data
			});
		}

		closeModal();
	}

	function editKnowledge(id) {
		const item = currentKnowledge.find(k => k.id === id);
		if (item) {
			openModal(item);
		}
	}

	function deleteKnowledge(id) {
		if (confirm('Are you sure you want to delete this knowledge item?')) {
			vscode.postMessage({
				command: 'delete',
				id
			});
		}
	}

	function formatTimestamp(timestamp) {
		if (!timestamp) return 'Unknown';
		const date = new Date(timestamp);
		return date.toLocaleString();
	}

	function escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	// Initialize
	vscode.postMessage({ command: 'loadAll' });
	vscode.postMessage({ command: 'getStats' });
})();
