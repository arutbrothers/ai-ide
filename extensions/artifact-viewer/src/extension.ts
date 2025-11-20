import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('artifact-viewer.view', (artifact) => {
    const panel = vscode.window.createWebviewPanel(
      'artifactViewer',
      `Artifact: ${artifact.id}`,
      vscode.ViewColumn.One,
      {}
    );

    panel.webview.html = getWebviewContent(artifact);
  });

  context.subscriptions.push(disposable);
}

function getWebviewContent(artifact: any) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Artifact Viewer</title>
    <script src="https://cdn.jsdelivr.net/npm/markdown-it@12.0.4/dist/markdown-it.min.js"></script>
</head>
<body>
    <h1>${artifact.type}</h1>
    <div id="content"></div>
    <hr>
    <h2>Comments</h2>
    <div id="comments"></div>
    <textarea id="comment-input" rows="4" cols="50"></textarea>
    <button id="add-comment">Add Comment</button>
    <script>
        const artifact = ${JSON.stringify(artifact)};
        const contentDiv = document.getElementById('content');
        if (artifact.type === 'Implementation Plan') {
            const md = window.markdownit();
            contentDiv.innerHTML = md.render(artifact.content);
        } else if (artifact.type === 'Screenshot') {
            contentDiv.innerHTML = '<img src="' + artifact.content.path + '" />';
        } else {
            contentDiv.innerHTML = '<pre>' + JSON.stringify(artifact.content, null, 2) + '</pre>';
        }
    </script>
</body>
</html>`;
}

export function deactivate() {}
