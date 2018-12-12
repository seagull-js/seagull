import { Command, FS } from '@seagull/commands'

export class Server extends Command {
  /** where to write a bundle file to */
  dstFile: string

  constructor(dstFile: string) {
    super()
    this.dstFile = dstFile
  }

  async execute() {
    const content = code
    await new FS.WriteFile(this.dstFile, content).execute()
  }

  async revert() {
    await new FS.DeleteFile(this.dstFile).execute()
  }
}

const code = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
app_1.default.listen(8080, () => {
    console.log('started');
});
`
