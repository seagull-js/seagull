import { Command } from '@seagull/commands'
import { FS, FSSandbox } from '@seagull/commands-fs'
import * as path from 'path'

export class Express extends Command {
  /** where to write a bundle file to */
  dstFile: string

  /** paths to page files */
  appFolder: string

  constructor(appFolder: string, dstFile: string) {
    super()
    this.appFolder = appFolder
    this.dstFile = dstFile
  }

  async execute() {
    const srcFolder = path.join(this.appFolder, 'src', 'routes')
    const routeFiles = await new FS.ListFiles(srcFolder, /tsx?$/).execute()

    const routes = routeFiles.map(f => this.getRelativeRouteName(f))
    const content = [this.header(), this.body(routes), this.footer()].join('\n')
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
      `const morgan = require('morgan');`,
      `const routes = require('@seagull/routes');`,
      'const bodyParser = require("body-parser");',
      'const app = express();',
      `app.use(morgan('combined'));`,
      'app.use(bodyParser.urlencoded({ extended: true }));',
      'app.use(bodyParser.json());',
      'app.use(express.static(`${process.cwd()}/dist/assets/static`));',
    ].join('\n')
  }

  private body(routes: string[]) {
    return routes
      .map(
        r => `
      try {
        const route = require("./routes${r}").default;
        if(!routes.routeIsValid(route)){
          throw new Error('Route not valid')
        }
        route.register(app);
      } catch (error) {
        console.log('error loading route:', '${r}', error);
      }`
      )
      .join('\n')
  }

  private footer() {
    return ['exports.default = app;'].join('\n')
  }

  private getRelativeRouteName(filePath: string) {
    const srcFolder = path.join(this.appFolder, 'src', 'routes')
    return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
  }
}
