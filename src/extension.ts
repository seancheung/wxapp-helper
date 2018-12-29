// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { Generator } from "./generator";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const generator = new Generator();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.createPage",
      (uri: vscode.Uri) => {
        generator.execute(uri, "page");
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.createComponent",
      (uri: vscode.Uri) => {
        generator.execute(uri, "component");
      }
    )
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
