import * as cdk from 'aws-cdk'
import * as aws from 'aws-sdk'

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
    const accountId = await this.getAccountId()
    const path = this.appPath
    const region = process.env.AWS_REGION || 'eu-central-1'
    const appProps = { account, accountId, path, region }
    this.app = new lib.ProjectApp(this.projectName, appProps)
    this.synthStack = this.app.synthesizeStack(this.projectName)
    this.logicalToPathMap = lib.createLogicalToPathMap(this.synthStack)
  }

  private checkOptions() {
    const noProfileCheck = this.opts.noProfileCheck
    return noProfileCheck ? this.noProfileCheck() : this.checkProfile()
  }

  private noProfileCheck() {
    lib.noCheckProfile()
    return true
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

  private async getAccountId() {
    return (await new aws.STS().getCallerIdentity().promise()).Account || ''
  }
}
