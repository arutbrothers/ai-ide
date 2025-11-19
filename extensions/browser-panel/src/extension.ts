import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "browser-panel" is now active!');

  let disposable = vscode.commands.registerCommand('browser-panel.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Browser Panel!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
