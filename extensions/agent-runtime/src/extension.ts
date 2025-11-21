import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "agent-runtime" is now active!');

  let disposable = vscode.commands.registerCommand('agent-runtime.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Agent Runtime!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
