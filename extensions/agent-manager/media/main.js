// @ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'updateAgents':
                updateAgentList(message.agents);
                break;
        }
    });

    function updateAgentList(agents) {
        const ul = document.querySelector('.agent-list');
        ul.textContent = '';
        for (const agent of agents) {
            ul.appendChild(createAgentCard(agent));
        }
    }

    function createAgentCard(agent) {
        const li = document.createElement('li');
        li.className = 'agent-card';
        li.innerHTML = `
            <h3>${agent.name}</h3>
            <p>Status: ${agent.status}</p>
            <progress value="${agent.progress}" max="100"></progress>
            <button class="pause-button">Pause</button>
        `;
        li.querySelector('.pause-button').addEventListener('click', () => {
            // Handle pause button click
            vscode.postMessage({
                type: 'pauseAgent',
                agentId: agent.id
            });
        });
        return li;
    }
}());
