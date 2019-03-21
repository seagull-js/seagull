import { Command } from '@seagull/commands'
import { FS, FSSandbox } from '@seagull/commands-fs'
import * as path from 'path'

export class Crons extends Command {
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
    const srcFolder = path.join(this.appFolder, 'src', 'routes', 'cron')
    const routeFiles = await new FS.ListFiles(srcFolder, /tsx?$/).execute()
    const routes = routeFiles.map(f => this.getRelativeRouteName(f))
    const content = routes.map(this.buildCronInfos)
    await new FS.WriteFile(this.dstFile, JSON.stringify(content)).execute()
  }

  async revert() {
    await new FS.DeleteFile(this.dstFile).execute()
  }

  private buildCronInfos(route: string) {
    const cronRoute = require(`${process.cwd()}/dist/routes/${route}`).default

    return { path: cronRoute.path, cron: cronRoute.cron }
  }

  private getRelativeRouteName(filePath: string) {
    const srcFolder = path.join(this.appFolder, 'src', 'routes')
    return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
  }
}
