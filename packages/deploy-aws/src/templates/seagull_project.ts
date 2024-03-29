import { FS } from '@seagull/commands-fs'
import { SDK } from 'aws-cdk'
import * as dotenv from 'dotenv'
import 'ts-node/register'
import * as aws from '../aws_sdk_handler'
import { emptyBucket, S3Handler } from '../aws_sdk_handler'
import * as lib from '../lib'
import { ProvideAssetFolder } from '../provide_asset_folder'
import { SeagullApp } from '../seagull_app'
import { setCredsByProfile } from '../set_aws_credentials'
import { Rule } from '../types'

interface SeagullProjectProps {
  account: string
  appPath: string
  branch: string
  stage: string
  profile: string
  region: string
  vpcId: string
  subnetIds: string
  handlers?: {
    acmHandler?: aws.ACMHandler
    cloudfrontHandler?: aws.CloudfrontHandler
    stsHandler?: aws.STSHandler
  }
}

export class SeagullProject {
  account: string
  appPath: string
  branch: string
  stage: string
  pkgJson: any
  profile: string
  region: string
  vpcId: string
  subnetIds: string[]
  acm: aws.ACMHandler
  cloudfront: aws.CloudfrontHandler
  sts: aws.STSHandler

  constructor(props: SeagullProjectProps) {
    this.account = props.account
    this.appPath = props.appPath
    this.branch = props.branch
    this.stage = props.stage
    this.profile = props.profile
    this.region = props.region
    this.pkgJson = require(`${this.appPath}/package.json`)
    this.vpcId = props.vpcId
    this.subnetIds = props.subnetIds && props.subnetIds.split(',') || []
    setCredsByProfile(this.profile)
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
    const globalProps = {
      accountId: (await aws.getAccountId(this.sts)) || '',
      branch: this.branch,
      projectName: this.pkgJson.name,
      region: this.region,
      stage: this.stage,
    }
    const itemProps = Object.assign({}, globalProps, { topic: 'items' })
    const logsProps = Object.assign({}, globalProps, { topic: 'logs' })
    const errorProps = Object.assign({}, globalProps, { topic: 'errors' })
    const itemBucketName = lib.getBucketName(itemProps)
    const logBucketName = lib.getBucketName(logsProps, true)
    const errorBucketName = lib.getBucketName(errorProps, true)
    const actions: string[] = [
      'sts:AssumeRole',
      'logs:*',
      'lambda:InvokeFunction',
      'lambda:InvokeAsync',
      'ses:*',
      's3:*',
      'ec2:*',
      'events:*',
      'cloudwatch:*',
    ]
    const aliasConfig = await aws.checkForAliasConfig(this.pkgJson, this.acm)

    // create the asset folder
    await addResources(this.appPath, itemBucketName)

    // construct the stack and the app
    const app = await this.createBareApp()
    const role = app.stack.addIAMRole('role', 'lambda.amazonaws.com', actions)
    app.role = role
    const env = await getEnv(name, this.appPath, this.stage, logBucketName)
    const logBucket = app.stack.addS3(logBucketName, role, false)
    const errorBucket = app.stack.addS3(errorBucketName, role, false)
    errorBucket.grantPublicAccess()
    const vpc = app.stack.addVPC('vpc', this.vpcId, this.subnetIds, [ this.region ])
    const lambda = app.stack.addLambda('lambda', this.appPath, role, vpc, env)
    const apiGW = app.stack.addUniversalApiGateway('apiGW', lambda, this.stage)
    const cloudfrontConfig = {
      aliasConfig,
      apiGateway: apiGW,
      errorBucket,
      logBucket,
    }
    app.stack.addCloudfront('cloudfront', cloudfrontConfig)
    const s3DeploymentNeeded = this.stage === 'prod' || this.branch === 'master'
    const importS3 = () => app.stack.importS3(itemBucketName, role)
    const addS3 = () => app.stack.addS3(itemBucketName, role)
    s3DeploymentNeeded ? addS3() : importS3()
    app.stack.addLogGroup(`/aws/lambda/${name}-lambda-handler`)
    app.stack.addLogGroup(`/${name}/data-log`)
    const addCrons = this.stage === 'prod' || this.branch === 'master'
    const cronJson = addCrons ? await buildCronJson(this.appPath) : []
    const addRule = (rule: Rule) => app.stack.addEventRule(rule, lambda)
    cronJson.forEach(addRule)

    return app
  }

  async createBareApp() {
    const account = this.account || (await new SDK({}).defaultAccount())
    const itemsProps = {
      accountId: (await aws.getAccountId(this.sts)) || '',
      branch: this.branch,
      projectName: this.pkgJson.name,
      region: this.region,
      stage: this.stage,
      topic: 'items',
    }
    const appProps = {
      addAssets: true,
      appPath: this.appPath,
      itemsBucket: lib.getBucketName(itemsProps),
      projectName: this.getAppName(),
      stackProps: { env: { account, region: this.region } },
    }
    return new SeagullApp(appProps)
  }

  async customizeStack(app: SeagullApp) {
    const extensionPath = `${this.appPath}/infrastructure-aws.ts`
    const hasExtensionFile = await new FS.Exists(extensionPath).execute()
    return hasExtensionFile && (await this.loadAndExecute(extensionPath, app))
  }

  async loadAndExecute(path: string, app: SeagullApp) {
    const extensionFkt = (await import(`${path}`)).default
    await extensionFkt(app)
  }

  getAppName() {
    const suffix = this.stage === 'test' ? `-${this.branch}-${this.stage}` : ''
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

  async destroyProject() {
    this.validate()
    const app = await this.createBareApp()
    const logsProps = {
      accountId: (await aws.getAccountId(this.sts)) || '',
      branch: this.branch,
      projectName: this.pkgJson.name,
      region: this.region,
      stage: this.stage,
      topic: 'logs',
    }
    const logBucket = await lib.getBucketName(logsProps, true)
    await emptyBucket(new S3Handler(), logBucket)
    await app.destroyStack()
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

async function getEnv(
  name: string,
  appPath: string,
  stage: string,
  logBucket: string
) {
  const env: any = {
    APP: name,
    LOG_BUCKET: logBucket,
    MODE: 'cloud',
    NODE_ENV: 'production',
    STAGE: stage,
  }
  const configPath = `${appPath}/.env.${stage}`
  const config: string = await new FS.ReadFile(configPath).execute()
  const configEnv = dotenv.parse(config)
  return {
    ...env,
    ...configEnv,
  }
}
