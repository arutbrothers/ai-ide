import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "agent-manager" is now active!');

  let disposable = vscode.commands.registerCommand('agent-manager.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Agent Manager!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
