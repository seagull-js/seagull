import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

import { FS } from '@seagull/commands-fs'

import { SeagullProject } from '../../src'

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
}
