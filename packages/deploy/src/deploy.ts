import * as cdk from 'aws-cdk'

import { ProfileCheck, ProvideAssetFolder } from './commands'
import { noCredentialsSet, ProjectApp } from './lib'

export interface Options {
  /**
   * if set, this indicates the aws profile that shall be used for deployment
   */
  profile?: string
}

export class Deploy {
  appPath: string
  opts: Options
  projectName: string

  app?: ProjectApp
  sdk: cdk.SDK

  constructor(appPath: string, opts: Options) {
    this.appPath = appPath
    this.opts = opts
    this.projectName = require(`${this.appPath}/package.json`).name
    this.sdk = new cdk.SDK({})
  }

  async execute() {
    const credCheck = new ProfileCheck(this.opts.profile)
    return credCheck.execute() ? this.deployApp() : noCredentialsSet()
  }

  async deployApp() {
    const provideAssetFolder = new ProvideAssetFolder(this.appPath)
    await provideAssetFolder.execute()
    await this.createCDKApp()
    await this.deployCDKApp()
  }

  private async createCDKApp() {
    const account = await this.sdk.defaultAccount()
    const region = process.env.AWS_REGION || 'eu-central-1'
    const path = this.appPath
    this.app = new ProjectApp(this.projectName, { account, path, region })
  }

  private async deployCDKApp() {
    const stack = this.app!.synthesizeStack(this.projectName)
    const env = stack.environment
    const toolkitInfo = await cdk.loadToolkitInfo(env, this.sdk, 'CDKToolkit')
    await cdk.bootstrapEnvironment(env, this.sdk, 'CDKToolkit', undefined)
    await cdk.deployStack({ sdk: this.sdk, stack, toolkitInfo })
  }
}
