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

export class FileGenerator {
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
  protected async prompt(type: string): Promise<string | undefined> {
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
  protected create(dir: string, name: string, type: string): void {
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

  protected decode(template: string): string {
    if (/^base64\:/i.test(template)) {
      return Buffer.from(template.substr(7), "base64").toString();
    }
    return template;
  }
}

abstract class TextGenerator {
  async execute() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const args = await this.prompt();
      if (args === undefined) {
        return;
      }
      const text = this.generate(args);
      if (text) {
        editor.edit(edit =>
          editor.selections.forEach(selection => {
            edit.delete(selection);
            edit.insert(selection.start, text);
          })
        );
      }
    }
  }

  protected abstract async prompt(): Promise<any>;
  protected abstract generate(args: any): string | undefined;
}

export class LoremGenerator extends TextGenerator {
  protected async prompt(): Promise<number | undefined> {
    const config = vscode.workspace.getConfiguration("wxapp-helper");
    const count = await vscode.window.showInputBox({
      value: config.get("lorem.count") || "10",
      ignoreFocusOut: true,
      placeHolder: `Please enter characters count`,
      validateInput(count: string): string | null {
        if (!count) {
          return "Count is required";
        }
        if (!/^\d+$/.test(count)) {
          return "Invalid count";
        }
        return null;
      },
      prompt: `Number of characters to insert`
    });
    if (count) {
      return parseInt(count);
    }
  }

  protected generate(count: number): string | undefined {
    const config = vscode.workspace.getConfiguration("wxapp-helper");
    const characters: string | undefined = config.get("lorem.characters");
    if (!characters) {
      vscode.window.showErrorMessage("No characters in config");
      return;
    }
    if (count <= characters.length) {
      return characters.slice(0, count);
    }
    const repeat = Math.floor(count / characters.length);
    const mod = count % characters.length;
    return (
      Array(repeat)
        .fill(characters)
        .join("") + characters.slice(0, mod)
    );
  }
}

export class ImageGenerator extends TextGenerator {
  protected async prompt(): Promise<[number, number] | undefined> {
    const config = vscode.workspace.getConfiguration("wxapp-helper");
    const width = config.get("image.width");
    const height = config.get("image.height");
    let size: string | undefined;
    if (width && height) {
      size = `${width}/${height}`;
    }
    const value = await vscode.window.showInputBox({
      value: size || "640/480",
      ignoreFocusOut: true,
      placeHolder: `Please enter image width/height, height can be omitted`,
      validateInput(size: string): string | null {
        if (!size) {
          return "Size is required";
        }
        if (!/^\d+(\/\d+)?$/.test(size)) {
          return "Invalid size";
        }
        return null;
      },
      prompt: `Image size`
    });
    if (value) {
      const [w, h] = value.split("/");
      return h ? [parseInt(w), parseInt(h)] : [parseInt(w), parseInt(w)];
    }
  }
  protected generate([width, height]: [number, number]): string | undefined {
    const config = vscode.workspace.getConfiguration("wxapp-helper");
    const src: string | undefined = config.get("image.src");
    if (src) {
      switch (src) {
        case "placeimg":
          return `https://placeimg.com/${width}/${height}/any`;
        case "picsum":
          return `https://picsum.photos/${width}/${height}`;
      }
    }
    vscode.window.showErrorMessage("No image source in config");
  }
}

export class AvatarGenerator extends TextGenerator {
  protected async prompt(): Promise<number | undefined> {
    const config = vscode.workspace.getConfiguration("wxapp-helper");
    const size: string | undefined = config.get("avatar.size");
    const value = await vscode.window.showInputBox({
      value: size || "128",
      ignoreFocusOut: true,
      placeHolder: `Please enter avatar size`,
      validateInput(size: string): string | null {
        if (!size) {
          return "Size is required";
        }
        if (!/^\d+$/.test(size)) {
          return "Invalid size";
        }
        return null;
      },
      prompt: `Avatar size`
    });
    if (value) {
      return parseInt(value);
    }
  }
  protected generate(size: number): string | undefined {
    const config = vscode.workspace.getConfiguration("wxapp-helper");
    const src: string | undefined = config.get("avatar.src");
    if (src) {
      switch (src) {
        case "pravatar":
          return `http://i.pravatar.cc/${size}`;
      }
    }
    vscode.window.showErrorMessage("No avatar source in config");
  }
}
