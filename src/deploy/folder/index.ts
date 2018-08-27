import * as fs from 'fs'
import { copySync } from 'fs-extra'
import { join } from 'path'
import { sync as rmSync } from 'rimraf'
import { DeployCommand } from '../'

export default class Folder extends DeployCommand {
  distFolder: string

  constructor(srcFolder: string) {
    super(srcFolder)
    this.distFolder = join(this.srcFolder, 'public')
  }

  async execute() {
    this.createDistFolder()
    this.copyIndexHtmlFile()
    this.copyAssetsFolder()
  }

  createDistFolder() {
    rmSync(this.distFolder)
    fs.mkdirSync(this.distFolder)
  }

  copyIndexHtmlFile() {
    const src = join(this.tmpFolder, 'index.html')
    const dest = join(this.distFolder, 'index.html')
    fs.copyFileSync(src, dest)
  }

  copyAssetsFolder() {
    const src = join(this.tmpFolder, 'assets')
    const dest = join(this.distFolder, 'assets')
    copySync(src, dest)
  }
}
