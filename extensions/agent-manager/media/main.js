(function () {
    const vscode = acquireVsCodeApi();

    const agentList = document.querySelector('.agent-list');

    // Handle messages from extension
    window.addEventListener('message', event => {
        const message = event.data;

        switch (message.type) {
            case 'updateAgents':
                renderAgents(message.agents);
                break;
        }
    });

    function renderAgents(agents) {
        if (!agentList) return;

        agentList.innerHTML = '';

        if (agents.length === 0) {
            agentList.innerHTML = '<li class="empty">No active agents. Use Cmd+Shift+A to create one.</li>';
            return;
        }

        agents.forEach(agent => {
            const li = document.createElement('li');
            li.className = 'agent-item';
            li.innerHTML = `
        <div class="agent-header">
          <span class="agent-icon">🤖</span>
          <span class="agent-id">${agent.id}</span>
          <span class="agent-status status-${agent.status}">${agent.status}</span>
        </div>
        <div class="agent-goal">${agent.goal}</div>
        <div class="agent-actions">
          <button class="btn-pause" data-id="${agent.id}">Pause</button>
          <button class="btn-details" data-id="${agent.id}">Details</button>
        </div>
      `;
            agentList.appendChild(li);
        });

        // Add event listeners
        document.querySelectorAll('.btn-pause').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                vscode.postMessage({ type: 'pauseAgent', id });
            });
        });

        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                vscode.postMessage({ type: 'viewDetails', id });
            });
        });
    }
})();
