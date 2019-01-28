import * as cdk from 'aws-cdk'
import * as aws from 'aws-sdk'

import { SynthesizedStack } from '@aws-cdk/cx-api'

import { FS } from '@seagull/commands-fs'

import { AliasConfiguration } from '@aws-cdk/aws-cloudfront'
import { ProfileCheck, ProvideAssetFolder } from './commands'
import * as lib from './lib'
import { getExistingCert, makeAliasConfig } from './lib/cdk/certificates'

export interface Options {
  /**
   * under which alias the cloudfront url is available
   */
  domains?: string[]
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
  /**
   * the region the stack should be deployed to
   */
  region: string
}

export abstract class CDKAction {
  aliasConfiguration?: AliasConfiguration
  appPath: string
  opts: Options
  projectName: string
  s3Name: string

  app?: lib.ProjectApp
  synthStack: SynthesizedStack
  logicalToPathMap: { [id: string]: string }
  sdk: cdk.SDK

  constructor(appPath: string, opts: Options) {
    this.appPath = appPath
    this.opts = opts
    this.projectName = this.getProjectName()
    this.s3Name = ''
    this.sdk = new cdk.SDK({})
    this.logicalToPathMap = {}
    this.synthStack = {} as SynthesizedStack
  }

  abstract async execute(): Promise<any>

  protected async validate() {
    return (await this.checkOptions()) && (await this.checkAppPath())
  }

  protected async createCDKApp() {
    const { region, domains } = this.opts
    const appProps = {
      account: await this.sdk.defaultAccount(),
      aliasConfiguration: await makeAliasConfig(region, domains),
      deployS3: this.opts.mode === 'prod' || this.opts.branchName === 'master',
      path: this.appPath,
      region: this.opts.region,
      s3Name: this.s3Name,
    }
    this.app = new lib.ProjectApp(this.projectName, appProps)
    this.synthStack = this.app.synthesizeStack(this.projectName)
  }
  protected async provideAssetFolder() {
    await this.setS3Name()
    const createFolder = new ProvideAssetFolder(this.appPath, this.s3Name)
    await createFolder.execute()
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

  private async setS3Name() {
    const accountId = await this.getAccountId()
    const region = this.opts.region
    const projectName = this.projectName
    const suffix = this.opts.mode === 'prod' ? '' : '-test'
    this.s3Name = `${region}-${accountId}-${projectName}-items${suffix}`
  }

  private async getAccountId() {
    return (await new aws.STS().getCallerIdentity().promise()).Account || ''
  }

  private getProjectName(): string {
    const branchName = this.opts.branchName
    const pkgName = require(`${this.appPath}/package.json`).name
    return this.opts.mode === 'prod' ? pkgName : `${pkgName}-${branchName}`
  }
}
