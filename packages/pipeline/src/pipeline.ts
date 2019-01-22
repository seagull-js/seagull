import * as cdk from 'aws-cdk'

import { SynthesizedStack } from '@aws-cdk/cx-api'

import { ProfileCheck } from './commands'
import * as lib from './lib'

export interface Options {
  /**
   * the branch name that will be deployed to indicate the project name for
   * the stack. Only needed for teast mode
   * @default master
   */
  branchName: string
  /**
   * indicates whether this deployment is run in test modus or production mode
   * production modus ensures the existence of an items s3 bucket, in test
   * mode multiple deployments use the same items bucket
   * @enum test|prod
   * @default prod
   */
  mode: 'test' | 'prod'
  /**
   * if set, the profile check is disabled.
   * @default false
   */
  noProfileCheck: boolean
  /**
   * if set, this indicates the aws profile that shall be used for deployment
   */
  profile?: string
}

export class DeployPipeline {
  appPath: string
  opts: Options
  projectName: string

  app?: lib.ProjectApp
  synthStack: SynthesizedStack
  logicalToPathMap: { [id: string]: string }
  sdk: cdk.SDK

  constructor(appPath: string, opts: Options) {
    this.appPath = appPath
    this.opts = opts
    this.projectName = this.getProjectName()
    this.sdk = new cdk.SDK({})
    this.logicalToPathMap = {}
    this.synthStack = {} as SynthesizedStack
  }

  async execute() {
    return (await this.validate()) && (await this.deployPipeline())
  }

  private async deployPipeline() {
    await this.createCDKPipeline()
    await this.deployCDKPipeline()
  }

  private async deployCDKPipeline() {
    const env = this.synthStack.environment
    const toolkitInfo = await cdk.loadToolkitInfo(env, this.sdk, 'CDKToolkit')
    await cdk.bootstrapEnvironment(env, this.sdk, 'CDKToolkit', undefined)
    const sdk = this.sdk
    const stack = this.synthStack
    await cdk.deployStack({ sdk, stack, toolkitInfo })
  }

  private async validate() {
    return await this.checkProfile()
  }

  private async createCDKPipeline() {
    const account = await this.sdk.defaultAccount()
    const region = process.env.AWS_REGION || 'eu-central-1'
    const path = this.appPath
    const branchName = this.opts.branchName
    const mode = this.opts.mode
    const props = { account, branchName, mode, path, region }
    this.app = new lib.ProjectApp(this.projectName, props)
    this.synthStack = this.app.synthesizeStack(this.projectName)
  }

  private async checkProfile() {
    const credsFound = new ProfileCheck(this.opts.profile).execute()
    // tslint:disable-next-line:no-unused-expression
    !credsFound && lib.noCredentialsSet()
    return credsFound
  }

  private getProjectName(): string {
    const branchName = this.opts.branchName
    const pkgName = `${require(`${this.appPath}/package.json`).name}-pipeline`
    return this.opts.mode === 'prod' ? pkgName : `${pkgName}-${branchName}`
  }
}
