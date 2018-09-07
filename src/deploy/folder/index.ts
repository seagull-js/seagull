/** @module Deploy */
import * as fs from 'fs'
import { join } from 'path'
import { sync as rmSync } from 'rimraf'
import { DeployCommand } from '../'
import { copyFile, listFiles } from '../../tools/util'

/**
 * Generate a folder named "public" within the app folder, where a static web
 * root folder will be generated. Contains at least a "index.html" file and a
 * folder called "assets" containing the file "bundle.js", which includes the
 * frontend app code.
 */
export class DeployToFolder extends DeployCommand {
  /**
   * where to generate the result folder
   */
  distFolder: string

  /**
   * Initialize the command with the root folder of the app and optionally a
   * folder path within the [[srcFolder]] where the app shall be generated.
   */
  constructor(srcFolder: string, distFolder: string = 'public') {
    super(srcFolder)
    this.distFolder = join(this.srcFolder, distFolder)
  }

  /**
   * What to do actually. Create the folder, copy the index.html file and all
   * assets.
   */
  async execute() {
    this.createDistFolder()
    this.copyIndexHtmlFile()
    this.copyAssetsFolder()
  }

  private createDistFolder() {
    rmSync(this.distFolder)
    fs.mkdirSync(this.distFolder)
  }

  private copyIndexHtmlFile() {
    const src = join(this.tmpFolder, 'index.html')
    const dest = join(this.distFolder, 'index.html')
    copyFile(src, dest)
  }

  private copyAssetsFolder() {
    const srcFolder = join(this.tmpFolder, 'assets')
    const destFolder = join(this.distFolder, 'assets')
    fs.mkdirSync(destFolder)
    for (const file of listFiles(srcFolder)) {
      const target = file.replace('.seagull/', 'public/')
      copyFile(file, target)
    }
  }
}
