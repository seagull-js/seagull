import * as cdk from 'aws-cdk'

import { SynthesizedStack } from '@aws-cdk/cx-api'

import { FS } from '@seagull/commands-fs'

import { ProfileCheck } from './commands'
import * as lib from './lib'

export interface Options {
  /**
   * if set, this indicates the aws profile that shall be used for deployment
   */
  profile?: string
  /**
   * if set, the profile check is disabled.
   */
  noProfileCheck?: boolean
}

export abstract class CDKAction {
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
    this.projectName = require(`${this.appPath}/package.json`).name
    this.sdk = new cdk.SDK({})
    this.logicalToPathMap = {}
    this.synthStack = {} as SynthesizedStack
  }

  abstract async execute(): Promise<any>

  protected async validate() {
    return (await this.checkOptions()) && (await this.checkAppPath())
  }

  protected async createCDKApp() {
    const account = await this.sdk.defaultAccount()
    const region = process.env.AWS_REGION || 'eu-central-1'
    const path = this.appPath
    this.app = new lib.ProjectApp(this.projectName, { account, path, region })
    this.synthStack = this.app.synthesizeStack(this.projectName)
    this.logicalToPathMap = lib.createLogicalToPathMap(this.synthStack)
  }

  checkOptions() {
    return this.opts.noProfileCheck ? lib.noCheckProfile() : this.checkProfile()
  }

  private async checkProfile() {
    const credsFound = new ProfileCheck(this.opts.profile).execute()
    // tslint:disable-next-line:no-unused-expression
    !credsFound && lib.noCredentialsSet()
    return credsFound
  }

  private async checkAppPath() {
    const assets = await new FS.Exists(`${this.appPath}/dist/assets`).execute()
    // tslint:disable-next-line:no-unused-expression
    !assets && lib.noAssetsFound()
    return assets
  }
}
