import { PolicyStatement, Role } from '@aws-cdk/aws-iam'
import { FS } from '@seagull/commands-fs'
import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import 'chai/register-should'
import { unlinkSync, writeFileSync } from 'fs'
import { cloneDeep, find } from 'lodash'
import { suite, test } from 'mocha-typescript'
import { SeagullApp, SeagullProject } from '../../src'
import { isInList } from '../test-helper/template_searching'
use(promisedChai)
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
  async 'assigns a default role to role property of SeagullApp'() {
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
    const app = await new SeagullProject(props).createSeagullApp()
    expect(app.role).to.be.instanceOf(Role)
  }

  @test
  async 'can add policies after creating SeagullApp'() {
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
    const app = await new SeagullProject(props).createSeagullApp()
    app.role!.addToPolicy(
      new PolicyStatement().addAllResources().addAction('action3')
    )
    const synth = app.synthesizeStack('helloworld')
    const newPolicyCriterion = resourceHasNewAction('action3')
    const hasNewPolicy = !!find(synth.template.Resources, newPolicyCriterion)
    hasNewPolicy.should.be.equal(true)
  }

  @test
  async 'can create a project and customize stack'() {
    const s3Name = 'another-s3'
    const infra = `import { SeagullApp } from '../src'
    export default function(app: SeagullApp) {
      app.stack.addS3('another-s3', app.role)
    }`
    writeFileSync(`${this.appPath}/infrastructure-aws.ts`, infra)

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
    const project = new SeagullProject(props)
    const app = await project.createSeagullApp()
    const stackName = 'helloworld'
    await project.customizeStack(app)
    const synthStack = app.synthesizeStack(stackName)
    const resources = Object.keys(synthStack.template.Resources)
    const metadata = Object.keys(synthStack.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equal(true)
    s3InMeta.should.be.equal(true)
    unlinkSync(`${this.appPath}/infrastructure-aws.ts`)
  }

  @test
  async 'customize stack throws when infrastructure-aws.ts is corrupted'() {
    writeFileSync(`${this.appPath}/infrastructure-aws.ts`, '')

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
    const project = new SeagullProject(props)
    const app = await project.createSeagullApp()

    const customize = async () => await project.customizeStack(app)
    expect(customize).to.be.rejectedWith(Error)
    unlinkSync(`${this.appPath}/infrastructure-aws.ts`)
  }

  @test
  async 'customizeStack should do nothing but return false without an infrastructure-aws.ts-file'() {
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
    const project = new SeagullProject(props)
    const app = await project.createSeagullApp()
    const appBeforeCustomization = cloneDeep(app)
    const returnValue = await project.customizeStack(app)
    expect(app).to.deep.equal(appBeforeCustomization)
    expect(returnValue).to.be.equal(false)
  }

  @test
  async 'can deploy a project without customized stack'() {
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
    const project = new SeagullProject(props)
    let hasBeenCalled = false
    const deployStack = () => (hasBeenCalled = true)
    project.createSeagullApp = () =>
      Promise.resolve(({ deployStack } as unknown) as SeagullApp)

    await project.deployProject()

    expect(hasBeenCalled).to.be.equal(true)
  }

  @test
  async 'can deploy a project with customized stack'() {
    const s3Name = 'another-s3'
    const infra = `import { SeagullApp } from '../src'
    export default function(app: SeagullApp) {
      app.stack.addS3('another-s3', app.role)
    }`
    writeFileSync(`${this.appPath}/infrastructure-aws.ts`, infra)

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
    const project = new SeagullProject(props)
    let hasBeenCalled = false
    const deployStack = async () => {
      hasBeenCalled = true
    }
    const createSeagullApp = project.createSeagullApp
    let app: SeagullApp
    project.createSeagullApp = async () => {
      app = await createSeagullApp.bind(project)()
      app.deployStack = deployStack
      return app
    }
    // project.createSeagullApp.bind(project)
    const stackName = 'helloworld'

    await project.deployProject()

    const synthStack = app!.synthesizeStack(stackName)
    const resources = Object.keys(synthStack.template.Resources)
    const metadata = Object.keys(synthStack.metadata)
    const stackNameNoDash = stackName.replace(/-/g, '')
    const s3NameNoDash = s3Name.replace(/-/g, '')
    const s3InTemp = isInList(resources, s3NameNoDash, stackNameNoDash)
    const s3InMeta = isInList(metadata, s3Name, stackName)
    s3InTemp.should.be.equal(true)
    s3InMeta.should.be.equal(true)

    hasBeenCalled.should.be.equal(true)
  }
}

const resPropHasNewAction = (action: string) => (resProp: any) =>
  !!resProp.Statement &&
  !!find(resProp.Statement, (s: any) => s.Action.includes(action))

const resourceHasNewAction = (action: string) => (res: any) =>
  !!find(res.Properties, resPropHasNewAction(action))
