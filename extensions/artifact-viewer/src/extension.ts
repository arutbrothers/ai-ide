import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "artifact-viewer" is now active!');

  let disposable = vscode.commands.registerCommand('artifact-viewer.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Artifact Viewer!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
