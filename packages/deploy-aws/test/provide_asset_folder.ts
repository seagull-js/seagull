import { FS } from '@seagull/commands-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { ProvideAssetFolder } from '../src'

@suite('ProvideAssetFolder')
export class Test extends BasicTest {
  tmpDir = '/tmp/tmp_for_folder_test'
  seagullPath = `${this.tmpDir}/.seagull`
  backendInSgPath = `${this.tmpDir}/.seagull/deploy/dist/assets/backend`
  filePathToTestRemoval = `${this.backendInSgPath}/remove.js`
  serverInSgPath = `${this.backendInSgPath}/server.js`
  lambdaInSgPath = `${this.backendInSgPath}/lambda.js`

  async before() {
    await BasicTest.prototype.before.bind(this)()
    await this.removeTmpDir()
    await new FS.CreateFolder(this.tmpDir).execute()
    await this.createDistAssetDir()
  }

  async createDistAssetDir() {
    const distBackendPath = `${this.tmpDir}/dist/assets/backend`
    await new FS.CreateFolder(distBackendPath).execute()
    await new FS.WriteFile(`${distBackendPath}/server.js`, 'Server').execute()
    await new FS.WriteFile(`${distBackendPath}/lambda.js`, 'Lambda').execute()
  }

  async removeTmpDir() {
    const tmpDirExists = await new FS.Exists(this.tmpDir).execute()
    return tmpDirExists && (await new FS.DeleteFolder(this.tmpDir).execute())
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
    await this.removeTmpDir()
  }

  @test
  async 'check whether asset folder is provided'() {
    const sgFolderExists = new FS.Exists(this.seagullPath)
    const provideFolder = new ProvideAssetFolder(this.tmpDir)
    const lambdaFileExists = new FS.Exists(this.lambdaInSgPath)
    const serverFileExists = new FS.Exists(this.serverInSgPath)

    const sgFolderExistsBefore = await sgFolderExists.execute()
    await provideFolder.execute()
    const sgFolderExistsAfter = await sgFolderExists.execute()
    const lambdaFileExistsResult = await lambdaFileExists.execute()
    const serverFileExistsResult = await serverFileExists.execute()

    sgFolderExistsBefore.should.be.equals(false)
    sgFolderExistsAfter.should.be.equals(true)
    serverFileExistsResult.should.be.equals(false)
    lambdaFileExistsResult.should.be.equals(true)
  }

  @test
  async 'check whether asset folder is provided, when there already is one'() {
    const sgFolderExists = new FS.Exists(this.seagullPath)
    const provideFolder = new ProvideAssetFolder(this.tmpDir)
    const fileRemoveExists = new FS.Exists(this.filePathToTestRemoval)
    const writeRemove = new FS.WriteFile(this.filePathToTestRemoval, 'Remove')
    const lambdaFileExists = new FS.Exists(this.lambdaInSgPath)
    const serverFileExists = new FS.Exists(this.serverInSgPath)

    const sgFolderExistsBefore = await sgFolderExists.execute()
    await provideFolder.execute()
    await writeRemove.execute()
    const fileRemoveExistsBefore = await fileRemoveExists.execute()
    await provideFolder.execute()
    const fileRemoveExistsAfter = await fileRemoveExists.execute()
    const lambdaFileExistsResult = await lambdaFileExists.execute()
    const serverFileExistsResult = await serverFileExists.execute()

    sgFolderExistsBefore.should.be.equals(false)
    fileRemoveExistsBefore.should.be.equals(true)
    fileRemoveExistsAfter.should.be.equals(false)
    serverFileExistsResult.should.be.equals(false)
    lambdaFileExistsResult.should.be.equals(true)
  }

  @test
  async 'check whether revert works'() {
    const sgFolderExists = new FS.Exists(this.seagullPath)
    const provideFolder = new ProvideAssetFolder(this.tmpDir)
    // const lambdaFileExists = new FS.Exists(this.lambdaInSgPath)
    // const serverFileExists = new FS.Exists(this.serverInSgPath)

    // const sgFolderExistsBefore = await sgFolderExists.execute()
    await provideFolder.execute()
    // const sgFolderExistsAfterDeploy = await sgFolderExists.execute()
    const revertResult = await provideFolder.revert()
    revertResult.should.be.equals(true)
    /*  TODO: Activate this, when revert command is implemented
     *  const sgFolderExistsAfterRevert = await sgFolderExists.execute()
     *  const lambdaFileExistsResult = await lambdaFileExists.execute()
     *  const serverFileExistsResult = await serverFileExists.execute()
     *  sgFolderExistsBefore.should.be.equals(false)
     *  sgFolderExistsAfterDeploy.should.be.equals(true)
     *  sgFolderExistsAfterRevert.should.be.equals(false)
     *  serverFileExistsResult.should.be.equals(false)
     *  lambdaFileExistsResult.should.be.equals(false)
     */
  }
}
