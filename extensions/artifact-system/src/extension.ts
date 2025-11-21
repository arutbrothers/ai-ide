import * as vscode from 'vscode';
import { ArtifactStore } from './ArtifactStore';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "artifact-system" is now active!');

  const artifactStore = new ArtifactStore(context.globalStorageUri.fsPath);

  let disposable = vscode.commands.registerCommand('artifact-system.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from Artifact System!');
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
