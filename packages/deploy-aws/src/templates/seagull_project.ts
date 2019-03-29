import { FS } from '@seagull/commands-fs'
import { SDK } from 'aws-cdk'
import 'ts-node/register'
import * as aws from '../aws_sdk_handler'
import * as lib from '../lib'
import { ProvideAssetFolder } from '../provide_asset_folder'
import { SeagullApp } from '../seagull_app'
import { Rule } from '../seagull_stack'
import { setCredsByProfile } from '../set_aws_credentials'

interface SeagullProjectProps {
  appPath: string
  branch: string
  mode: string
  profile: string
  region: string
  handlers?: {
    acmHandler?: aws.ACMHandler
    cloudfrontHandler?: aws.CloudfrontHandler
    stsHandler?: aws.STSHandler
  }
}

export class SeagullProject {
  appPath: string
  branch: string
  mode: string
  pkgJson: any
  profile: string
  region: string
  acm: aws.ACMHandler
  cloudfront: aws.CloudfrontHandler
  sts: aws.STSHandler

  constructor(props: SeagullProjectProps) {
    this.appPath = props.appPath
    this.branch = props.branch
    this.mode = props.mode
    this.profile = props.profile
    this.region = props.region
    this.pkgJson = require(`${this.appPath}/package.json`)
    const propsACMHandler = props.handlers && props.handlers.acmHandler
    const propsCFHandler = props.handlers && props.handlers.cloudfrontHandler
    const propsSTSHandler = props.handlers && props.handlers.stsHandler
    this.acm = propsACMHandler || new aws.ACMHandler()
    this.cloudfront = propsCFHandler || new aws.CloudfrontHandler()
    this.sts = propsSTSHandler || new aws.STSHandler()
  }

  async createSeagullApp() {
    // preparations for deployment
    const name = this.getAppName()
    const sdk = new SDK({})
    const account = await sdk.defaultAccount()
    const itemBucketName = await this.getBucketName()
    const actions: string[] = [
      'sts:AssumeRole',
      'logs:CreateLogStream',
      'logs:PutLogEvents',
      'lambda:InvokeFunction',
      'lambda:InvokeAsync',
      'ses:*',
      's3:*',
      'events:*',
    ]
    const aliasConfig = await aws.checkForAliasConfig(this.pkgJson, this.acm)
    const appProps = {
      addAssets: true,
      appPath: this.appPath,
      itemsBucket: itemBucketName,
      projectName: name,
      stackProps: { env: { account, region: this.region } },
    }

    // create the asset folder
    await addResources(this.appPath, itemBucketName)

    // construct the stack and the app
    const app = new SeagullApp(appProps)
    const role = app.stack.addIAMRole('role', 'lambda.amazonaws.com', actions)
    app.role = role
    const lambda = app.stack.addUniversalLambda('lambda', this.appPath, role)
    const apiGW = app.stack.addUniversalApiGateway('apiGW', lambda, this.mode)
    app.stack.addCloudfront('cloudfront', { apiGateway: apiGW, aliasConfig })
    const s3DeploymentNeeded = this.mode === 'prod' || this.branch === 'master'
    const importS3 = () => app.stack.importS3(itemBucketName, role)
    const addS3 = () => app.stack.addS3(itemBucketName, role)
    s3DeploymentNeeded ? addS3() : importS3()
    app.stack.addLogGroup(`/aws/lambda/${name}-lambda-handler`)
    app.stack.addLogGroup(`/${name}/data-log`)
    const cronJson = await buildCronJson(this.appPath)
    cronJson.forEach((rule: Rule) => {
      app.stack.addEventRule(rule, lambda)
    })

    return app
  }

  async customizeStack(app: SeagullApp) {
    const extensionPath = `${this.appPath}/infrastructure-aws.ts`
    const hasExtensionFile = await new FS.Exists(extensionPath).execute()
    return hasExtensionFile && (await import(`${extensionPath}`)).default(app)
  }

  getAppName() {
    const suffix = this.mode === 'test' ? `-${this.branch}-${this.mode}` : ''
    return `${this.pkgJson.name}${suffix}`.replace(/[^0-9A-Za-z-]/g, '')
  }

  async deployProject() {
    this.validate()
    const app = await this.createSeagullApp()
    await this.customizeStack(app)
    await app.deployStack()
    const url = (await aws.getCFURL(this.getAppName(), this.cloudfront)) || ''
    await new FS.WriteFile('/tmp/cfurl.txt', url).execute()
    console.info('cloudfront-url', url)
  }

  async diffProject() {
    const app = await this.createSeagullApp()
    await this.customizeStack(app)
    await app.diffStack()
  }

  validate() {
    const hasValidProfile = setCredsByProfile(this.profile)
    // tslint:disable-next-line:no-unused-expression
    !hasValidProfile && lib.noCredentialsSet()
  }

  async getBucketName() {
    const accountId = await aws.getAccountId(this.sts)
    const prefix = `${this.region}-${accountId}-`
    const bucketName = `${require(`${this.appPath}/package.json`).name}-items`
    const suffix = `${this.mode !== 'prod' ? `-${this.mode}` : ''}`
    return `${prefix}${bucketName}${suffix}`
  }
}

async function addResources(appPath: string, itemsBucket?: string) {
  const provideAssetFolder = new ProvideAssetFolder(appPath)
  await provideAssetFolder.execute()
  // tslint:disable-next-line:no-unused-expression
  itemsBucket && (await replaceS3BucketName(appPath, itemsBucket))
}

async function replaceS3BucketName(appPath: string, itemsBucket: string) {
  const lambdaPath = `.seagull/deploy/dist/assets/backend/lambda.js`
  const lambdaFile = `${appPath}/${lambdaPath}`
  const lambda = await new FS.ReadFile(lambdaFile).execute()
  const lambdaWithBucketName = lambda.replace('demo-bucket', itemsBucket)
  await new FS.WriteFile(lambdaFile, lambdaWithBucketName).execute()
}

async function buildCronJson(appPath: string) {
  const cronPath = `${appPath}/dist/cron.json`
  const cronFile = await new FS.ReadFile(cronPath).execute()
  return cronFile && cronFile !== '' ? JSON.parse(cronFile) : []
}
