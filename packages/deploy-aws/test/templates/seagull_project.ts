import { PolicyStatement, Role } from '@aws-cdk/aws-iam'
import { FS } from '@seagull/commands-fs'
import { BasicTest } from '@seagull/testing'
import { expect, use } from 'chai'
import * as promisedChai from 'chai-as-promised'
import 'chai/register-should'
import { cloneDeep, find } from 'lodash'
import { suite, test, timeout } from 'mocha-typescript'
import { SeagullApp, SeagullProject } from '../../src'
import { isInList } from '../test-helper/template_searching'
use(promisedChai)

const s3Name = 'another-s3'
const customizationCode = `import { SeagullApp } from '../src'
export default function(app: SeagullApp) {
  app.stack.addS3('another-s3', app.role)
}`

@suite('SeagullProject')
export class Test extends BasicTest {
  appPath = `${process.cwd()}/test_data`
  projectProps = {
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
  async before() {
    await BasicTest.prototype.before.bind(this)()
    process.env.AWS_REGION = 'eu-central-1'
    const assetFolder = `${this.appPath}/dist/assets`
    const backendFolder = `${assetFolder}/backend`
    const createBackendFolder = new FS.CreateFolder(backendFolder)
    await createBackendFolder.execute()
    await new FS.WriteFile(`${backendFolder}/server.js`, '').execute()
    await new FS.WriteFile(`${backendFolder}/lambda.js`, '').execute()
    await new FS.WriteFile(`${this.appPath}/dist/cron.json`, '[]').execute()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }

  @test
  async 'can create a project'() {
    const project = await new SeagullProject(
      this.projectProps
    ).createSeagullApp()
    const synthStack = project.synthesizeStack('helloworld')
    Object.keys(synthStack.template.Resources).length.should.be.above(1)
  }

  @test
  async 'assigns a default role to role property of SeagullApp'() {
    const app = await new SeagullProject(this.projectProps).createSeagullApp()
    expect(app.role).to.be.instanceOf(Role)
  }

  @test
  async 'can add policies after creating SeagullApp'() {
    const app = await new SeagullProject(this.projectProps).createSeagullApp()
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
    await writeCustomInfraFile(this.appPath)
    const project = new SeagullProject(this.projectProps)
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
    await deleteCustomInfra(this.appPath)
  }

  /** This test needs to use another directory, because imports are cached
   * and here the import of infrastructure-aws.ts needs to be something
   * other than the infrastructure-aws.ts above */
  @test
  async 'customize stack throws when infrastructure-aws.ts is corrupted'() {
    const newCWD = `${this.appPath}/corrupted-infrastructure`
    const assetFolder = `${newCWD}/dist/assets`
    const backendFolder = `${assetFolder}/backend`
    const createBackendFolder = new FS.CreateFolder(backendFolder)
    await createBackendFolder.execute()
    await new FS.WriteFile(`${backendFolder}/server.js`, '').execute()
    await new FS.WriteFile(`${backendFolder}/lambda.js`, '').execute()
    await new FS.WriteFile(`${newCWD}/dist/cron.json`, '[]').execute()
    await writeCustomInfraFile(newCWD, 'export default 123')

    const props = {
      accountId: 'test-account-id',
      appPath: `${this.appPath}/corrupted-infrastructure`,
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

    const customize = () => project.customizeStack(app)
    await expect(customize()).to.be.rejectedWith(Error)
    await deleteCustomInfra(`${this.appPath}/corrupted-infrastructure`)
  }

  @test
  async 'customizeStack should do nothing but return false without an infrastructure-aws.ts-file'() {
    const project = new SeagullProject(this.projectProps)
    const app = await project.createSeagullApp()
    const appBeforeCustomization = cloneDeep(app)
    const returnValue = await project.customizeStack(app)
    expect(app).to.deep.equal(appBeforeCustomization)
    expect(returnValue).to.be.equal(false)
  }

  @test
  async 'can deploy a project without customized stack'() {
    const project = new SeagullProject(this.projectProps)
    let hasBeenCalled = false
    const deployStack = () => (hasBeenCalled = true)
    project.createSeagullApp = () =>
      Promise.resolve(({ deployStack } as unknown) as SeagullApp)

    await project.deployProject()

    expect(hasBeenCalled).to.be.equal(true)
  }

  @test
  async 'can deploy a project with customized stack'() {
    await writeCustomInfraFile(this.appPath)

    const project = new SeagullProject(this.projectProps)
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
    await deleteCustomInfra(this.appPath)
  }

  @test
  async 'can diff a project without customized stack'() {
    const project = new SeagullProject(this.projectProps)
    let hasBeenCalled = false
    const diffStack = () => (hasBeenCalled = true)
    project.createSeagullApp = () =>
      Promise.resolve(({ diffStack } as unknown) as SeagullApp)

    await project.diffProject()

    expect(hasBeenCalled).to.be.equal(true)
  }

  @test
  async 'can diff a project with customized stack'() {
    await writeCustomInfraFile(this.appPath)

    const project = new SeagullProject(this.projectProps)
    let hasBeenCalled = false
    const diffStack = async () => {
      hasBeenCalled = true
    }
    const createSeagullApp = project.createSeagullApp
    let app: SeagullApp
    project.createSeagullApp = async () => {
      app = await createSeagullApp.bind(project)()
      app.diffStack = diffStack
      return app
    }
    const stackName = 'helloworld'

    await project.diffProject()

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
    await deleteCustomInfra(this.appPath)
  }
}

const deleteCustomInfra = async (appPath: string) => {
  const customInfraDel = new FS.DeleteFile(`${appPath}/infrastructure-aws.ts`)
  await customInfraDel.execute()
  customInfraDel.mode = { environment: 'edge' }
  await customInfraDel.execute()
}

const writeCustomInfraFile = async (
  appPath: string,
  code = customizationCode
) => {
  const customizationPath = `${appPath}/infrastructure-aws.ts`
  const customInfraGen = new FS.WriteFile(customizationPath, code)
  await customInfraGen.execute()
  customInfraGen.mode = { environment: 'edge' }
  await customInfraGen.execute()
}

const resPropHasNewAction = (action: string) => (resProp: any) =>
  !!resProp.Statement &&
  !!find(resProp.Statement, (s: any) => s.Action.includes(action))

const resourceHasNewAction = (action: string) => (res: any) =>
  !!find(res.Properties, resPropHasNewAction(action))
