import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import * as stringcase from "stringcase";

class DuplicateError extends Error {
  constructor(public file: string, message?: string) {
    super(message);
    Error.captureStackTrace(this.constructor);
  }
}

export class Generator {
  async execute(uri: vscode.Uri, type: "page" | "component"): Promise<void> {
    const name: string | undefined = await this.prompt(type);
    if (!name) {
      return;
    }
    if (!uri) {
      return;
    }
    try {
      this.create(uri.fsPath, name, type);
    } catch (error) {
      if (error instanceof DuplicateError) {
        vscode.window.showErrorMessage(
          `${stringcase.capitalcase(type)} already exists`
        );
      } else {
        console.error(error);
        vscode.window.showErrorMessage(`Error: ${error.message}`);
      }
      return;
    }
    vscode.window.showInformationMessage(
      `${stringcase.capitalcase(type)}: '${name}' successfully created`
    );
  }
  async prompt(type: string): Promise<string | undefined> {
    return vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: `Please enter ${type} name`,
      validateInput(name: string): string | null {
        if (!name) {
          return "Name is required";
        }
        if (/[\\/:*?"<>|]/.test(name)) {
          return "Invalid Component name";
        }
        if (/[\s]/.test(name)) {
          return "Spaces are not allowed";
        }
        return null;
      },
      prompt: `${type} name`
    });
  }
  create(dir: string, name: string, type: string): void {
    const config = vscode.workspace.getConfiguration("wxapp-helper");
    const ts: boolean | undefined = config.get(`${type}.typescript`);
    const conv: stringcase.Conventions =
      config.get("namingConvention") || "spinalcase";

    name = stringcase[conv](name);
    const filename: string = config.get(`${type}.name`) || name;
    const dirname = path.join(dir, name);
    if (fs.existsSync(dirname)) {
      throw new DuplicateError(dirname);
    }
    fs.mkdirSync(dirname);
    const script: string | undefined = config.get(`${type}.script`);
    if (script != null) {
      fs.writeFileSync(
        path.join(dirname, `${filename}.${ts ? "ts" : "js"}`),
        this.decode(script)
      );
    }
    const wxml: string | undefined = config.get(`${type}.wxml`);
    if (wxml != null) {
      fs.writeFileSync(
        path.join(dirname, `${filename}.wxml`),
        this.decode(wxml)
      );
    }
    const wxss: string | undefined = config.get(`${type}.wxss`);
    if (wxss != null) {
      fs.writeFileSync(
        path.join(dirname, `${filename}.wxss`),
        this.decode(wxss)
      );
    }
    const json: string | undefined = config.get(`${type}.json`);
    if (json != null) {
      fs.writeFileSync(
        path.join(dirname, `${filename}.json`),
        this.decode(json)
      );
    }
  }

  decode(template: string): string {
    if (/^base64\:/i.test(template)) {
      return Buffer.from(template.substr(7), "base64").toString();
    }
    return template;
  }
}
