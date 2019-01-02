# wxapp-helper

WeChat Mini App Helper

## Features

- Generate page/component files from explorer context menu
- Customizable page/component template(.js, .wxml, .wxss, .json)
- Customizable file names and naming conventions
- Support TypeScript files generating

## Extension Settings

This extension contributes the following settings:

- `wxapp-helper.namingConvention`: Naming convention for generated files
- `wxapp-helper.page.typescript`: Using TypeScript instead of JavaScript
- `wxapp-helper.page.name`: Page file names without extensions. Set to null to be equal to folder name
- `wxapp-helper.page.script`: Page script template
- `wxapp-helper.page.wxml`: Page wxml template
- `wxapp-helper.page.wxss`: Page wxss template
- `wxapp-helper.page.json`: Page json template
- `wxapp-helper.component.typescript`: Using TypeScript instead of JavaScript
- `wxapp-helper.component.name`: Component file names without extensions. Set to null to be equal to folder name
- `wxapp-helper.component.script`: Component script template
- `wxapp-helper.component.wxml`: Component wxml template
- `wxapp-helper.component.wxss`: Component wxss template
- `wxapp-helper.component.json`: Component json template

## Release Notes

### 0.1.0

Initial release of wxapp-helper

### 0.1.1

- Fixed Base64 encoded templates parsing error
