// @ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'updateContent':
                updateContent(message.content);
                break;
        }
    });

    function updateContent(content) {
        const root = document.querySelector('#root');
        root.innerHTML = content;
    }
}());
