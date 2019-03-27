import { FS } from '@seagull/commands-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { unlinkSync, writeFileSync } from 'fs'
import { suite, test } from 'mocha-typescript'
import { SeagullProject } from '../../src'
import { isInList } from '../test-helper/template_searching'

@suite('SeagullProject')
export class Test extends BasicTest {
  appPath = `${process.cwd()}/test_data`
  async before() {
    await BasicTest.prototype.before.bind(this)()
    process.env.AWS_REGION = 'eu-central-1'
    const assetFolder = `${this.appPath}/dist/assets`
    const backendFolder = `${assetFolder}/backend`
    const createBackendFolder = new FS.CreateFolder(backendFolder)
    await createBackendFolder.execute()
    await new FS.WriteFile(`${backendFolder}/server.js`, '').execute()
    await new FS.WriteFile(`${backendFolder}/lambda.js`, '').execute()
    await new FS.WriteFile(
      `${this.appPath}/dist/cron.json`,
      JSON.stringify([])
    ).execute()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }
  @test
  async 'can create a project'() {
    const props = {
      accountId: 'test-account-id',
      appPath: this.appPath,
      branch: 'master',
      githubToken: 'Token123',
      mode: 'prod',
      owner: 'me',
      profile: 'default',
      region: 'eu-central-1',
      repository: 'test-repo',
    }
    const project = await new SeagullProject(props).createSeagullApp()
    const synthStack = project.synthesizeStack('helloworld')
    Object.keys(synthStack.template.Resources).length.should.be.above(1)
  }

  @test
  async 'can create a project with customized stack'() {
    const s3Name = 'another-s3'
    const infra = `import { SeagullApp } from '../src'
    export default function(app: SeagullApp) {
      app.stack.addS3('another-s3', app.stack.defaultRole)
    }`
    writeFileSync(`${this.appPath}/infrastructure.ts`, infra)

    const props = {
      accountId: 'test-account-id',
      appPath: this.appPath,
      branch: 'master',
      githubToken: 'Token123',
      mode: 'prod',
      owner: 'me',
      profile: 'default',
      region: 'eu-central-1',
      repository: 'test-repo',
    }
    const project = await new SeagullProject(props).createSeagullApp()
    const stackName = 'helloworld'
    const synthStack = project.synthesizeStack(stackName)
    const resources = Object.keys(synthStack.template.Resources)
    const metadata = Object.keys(synthStack.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equal(true)
    s3InMeta.should.be.equal(true)
    unlinkSync(`${this.appPath}/infrastructure.ts`)
  }
}
