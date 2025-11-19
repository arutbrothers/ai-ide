import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "knowledge-base" is now active!');

  let disposable = vscode.commands.registerCommand('knowledge-base.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Knowledge Base!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
