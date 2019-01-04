import { Command } from '@seagull/commands'
import { FS } from '@seagull/commands-fs'
import { cannotRevertAssetFolder } from '../lib'

export class ProvideAssetFolder extends Command {
  private createDistFolder: Command
  private checkAssetFolder: Command
  private deleteAssetFolder: Command
  private copyAssetFolder: Command
  private deleteServerFile: Command

  private folderExists: boolean

  private s3BucketName: string
  private lambdaPath: string

  constructor(appPath: string, s3BucketName: string) {
    super()
    const assetPath = `${appPath}/dist/assets`
    const deployPath = `${appPath}/.seagull/deploy/dist`
    const newAssetPath = `${deployPath}/assets`
    const serverJsPath = `${newAssetPath}/backend/server.js`
    this.lambdaPath = `${newAssetPath}/backend/lambda.js`

    this.createDistFolder = new FS.CreateFolder(deployPath)
    this.checkAssetFolder = new FS.Exists(newAssetPath)
    this.deleteAssetFolder = new FS.DeleteFolder(newAssetPath)
    this.copyAssetFolder = new FS.CopyFolder(assetPath, newAssetPath)
    this.deleteServerFile = new FS.DeleteFile(serverJsPath)
    this.folderExists = false

    this.s3BucketName = s3BucketName
  }

  async execute() {
    this.folderExists = await this.checkAssetFolder.execute()
    // tslint:disable-next-line:no-unused-expression
    this.folderExists && (await this.deleteAssetFolder.execute())
    await this.createDistFolder.execute()
    await this.copyAssetFolder.execute()
    await this.deleteServerFile.execute()
    await this.replaceS3BucketName()
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

  private async replaceS3BucketName() {
    const lambda = await new FS.ReadFile(this.lambdaPath).execute()
    const lambdaBucketName = lambda.replace('demo-bucket', this.s3BucketName)
    await new FS.WriteFile(this.lambdaPath, lambdaBucketName).execute()
  }
}
