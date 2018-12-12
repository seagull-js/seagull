import { FS, Service } from '@seagull/commands'
import * as path from 'path'

export class Cleaner extends Service {
  /**
   * reference to where the app code resides in
   */
  appFolder: string

  constructor(appFolder: string) {
    super()
    this.appFolder = appFolder
  }

  async initialize() {
    this.registerRimraf()
    this.registerCreateBackendFolder()
    this.registerCreatePagesFolder()
    this.registerCopyStaticFolder()
  }

  private registerRimraf(name: string = 'rimraf') {
    const location = path.join(this.appFolder, 'dist')
    this.register(name, new FS.DeleteFolder(location))
  }

  private registerCreateBackendFolder(name: string = 'mkdir-backend') {
    const location = path.join(this.appFolder, 'dist', 'assets', 'backend')
    this.register(name, new FS.CreateFolder(location))
  }

  private registerCreatePagesFolder(name: string = 'mkdir-pages') {
    const location = path.join(this.appFolder, 'dist', 'assets', 'pages')
    this.register(name, new FS.CreateFolder(location))
  }

  private registerCopyStaticFolder(name: string = 'copy-static') {
    const from = path.join(this.appFolder, 'static')
    const to = path.join(this.appFolder, 'dist', 'assets', 'static')
    this.register(name, new FS.CopyFolder(from, to))
  }
}
