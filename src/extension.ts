// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  FileGenerator,
  LoremGenerator,
  ImageGenerator,
  AvatarGenerator
} from "./generator";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const file = new FileGenerator();
  const lorem = new LoremGenerator();
  const image = new ImageGenerator();
  const avatar = new AvatarGenerator();

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.createPage",
      (uri: vscode.Uri) => {
        file.execute(uri, "page");
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "extension.createComponent",
      (uri: vscode.Uri) => {
        file.execute(uri, "component");
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.insertLorem", () => {
      lorem.execute();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.insertImage", () => {
      image.execute();
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.insertAvatar", () => {
      avatar.execute();
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
