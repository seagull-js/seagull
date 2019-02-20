import { Command } from '@seagull/commands'
import { FS } from '@seagull/commands-fs'
import { cannotRevertAssetFolder } from './lib'

export class ProvideAssetFolder extends Command {
  private createDistFolder: Command
  private checkAssetFolder: Command
  private deleteAssetFolder: Command
  private copyAssetFolder: Command
  private deleteServerFile: Command

  constructor(appPath: string) {
    super()
    const assetPath = `${appPath}/dist/assets`
    const deployPath = `${appPath}/.seagull/deploy/dist`
    const newAssetPath = `${deployPath}/assets`
    const serverJsPath = `${newAssetPath}/backend/server.js`

    this.createDistFolder = new FS.CreateFolder(deployPath)
    this.checkAssetFolder = new FS.Exists(newAssetPath)
    this.deleteAssetFolder = new FS.DeleteFolder(newAssetPath)
    this.copyAssetFolder = new FS.CopyFolder(assetPath, newAssetPath)
    this.deleteServerFile = new FS.DeleteFile(serverJsPath)
  }

  async execute() {
    const folderExists = await this.checkAssetFolder.execute()
    // tslint:disable-next-line:no-unused-expression
    folderExists && (await this.deleteAssetFolder.execute())
    await this.createDistFolder.execute()
    await this.copyAssetFolder.execute()
    await this.deleteServerFile.execute()
  }

  async revert() {
    cannotRevertAssetFolder()
    return true
    /* TODO: When these command below have a sane revert command, use this:
     * await this.deleteServerFile.revert()
     * await this.copyAssetFolder.revert()
     * await this.createDistFolder.revert()
     * // tslint:disable-next-line:no-unused-expression
     * this.folderExists && (await this.deleteAssetFolder.revert())
     **/
  }
}
