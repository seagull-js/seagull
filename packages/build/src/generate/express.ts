import { Command, FS } from '@seagull/commands'

export class Express implements Command {
  /** where to write a bundle file to */
  dstFile: string

  /** paths to page files */
  routes: string[]

  constructor(routes: string[], dstFile: string) {
    this.routes = routes || []
    this.dstFile = dstFile
  }

  async execute() {
    const content = [this.header(), this.body(), this.footer()].join('\n')
    await new FS.WriteFile(this.dstFile, content).execute()
  }

  async revert() {
    await new FS.DeleteFile(this.dstFile).execute()
  }

  // general initialization of the app object
  private header() {
    return [
      'Object.defineProperty(exports, "__esModule", { value: true });',
      'const express = require("express");',
      'app.use(express.static(`${process.cwd()}/dist/assets/static`));',
    ].join('\n')
  }

  private body() {
    return this.routes
      .map(r => `require("./routes/${r}").default.register(app);`)
      .join('\n')
  }

  private footer() {
    return ['exports.default = app;'].join('\n')
  }
}
