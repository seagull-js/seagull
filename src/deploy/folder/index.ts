import * as fs from 'fs'
import { join } from 'path'
import { sync as rmSync } from 'rimraf'
import { DeployCommand } from '../'
import { listFiles } from '../../tools/util'

export class Folder extends DeployCommand {
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
    this.copyFile(src, dest)
  }

  copyAssetsFolder() {
    const srcFolder = join(this.tmpFolder, 'assets')
    const destFolder = join(this.distFolder, 'assets')
    fs.mkdirSync(destFolder)
    for (const file of listFiles(srcFolder)) {
      const target = file.replace('.seagull/', 'public/')
      this.copyFile(file, target)
    }
  }

  private copyFile(from: string, to: string) {
    fs.writeFileSync(to, fs.readFileSync(from))
  }
}
