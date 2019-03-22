import { SDK } from 'aws-cdk'
import { ACM, STS } from 'aws-sdk'

import { FS } from '@seagull/commands-fs'

import * as lib from '../lib'
import { ProvideAssetFolder } from '../provide_asset_folder'
import { SeagullApp } from '../seagull_app'
import { Rule } from '../seagull_stack'
import { setCredsByProfile } from '../set_aws_credentials'

interface SeagullProjectProps {
  accountId?: string
  appPath: string
  branch: string
  mode: string
  profile: string
  region: string
}

export class SeagullProject {
  accountId?: string
  appPath: string
  branch: string
  cronJson: any
  mode: string
  pkgJson: any
  profile: string
  region: string

  constructor(props: SeagullProjectProps) {
    this.accountId = props.accountId
    this.appPath = props.appPath
    this.branch = props.branch
    this.mode = props.mode
    this.profile = props.profile
    this.region = props.region
    this.pkgJson = require(`${this.appPath}/package.json`)
    this.cronJson = require(`${this.appPath}/dist/cron.json`)
  }

  async createSeagullApp() {
    // preparations for deployment
    const suffix = this.mode === 'test' ? `-${this.branch}-${this.mode}` : ''
    const name = `${this.pkgJson.name}${suffix}`
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
    const aliasConfig = await checkForAliasConfig(this.pkgJson)
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
    const lambda = app.stack.addUniversalLambda('lambda', this.appPath, role)
    const apiGateway = app.stack.addUniversalApiGateway('api-gateway', lambda)
    app.stack.addCloudfront('cloudfront', { apiGateway, aliasConfig })
    const s3DeploymentNeeded = this.mode === 'prod' || this.branch === 'master'
    const importS3 = () => app.stack.importS3(itemBucketName, role)
    const addS3 = () => app.stack.addS3(itemBucketName, role)
    s3DeploymentNeeded ? addS3() : importS3()
    app.stack.addLogGroup(`/aws/lambda/${name}-lambda-handler`)
    app.stack.addLogGroup(`/${name}/data-log`)
    console.info('this.cronJson', this.cronJson)
    this.cronJson.forEach((rule: Rule) => {
      app.stack.addEventRule(rule, lambda)
    })

    return app
  }

  async deployProject() {
    this.validate()
    const app = await this.createSeagullApp()
    await app.deployStack()
  }

  async diffProject() {
    const app = await this.createSeagullApp()
    await app.diffStack()
  }

  validate() {
    const hasValidProfile = setCredsByProfile(this.profile)
    // tslint:disable-next-line:no-unused-expression
    !hasValidProfile && lib.noCredentialsSet()
  }

  async getBucketName() {
    const accountId = await getAccountId(this.accountId)
    const prefix = `${this.region}-${accountId}-`
    const bucketName = `${require(`${this.appPath}/package.json`).name}-items`
    const suffix = `${this.mode !== 'prod' ? `-${this.mode}` : ''}`
    return `${prefix}${bucketName}${suffix}`
  }
}

async function checkForAliasConfig(pkgJson: any) {
  const domains: string[] = pkgJson.seagull && pkgJson.seagull.domains
  const needAliases = domains && domains.length > 0
  return needAliases ? await getAliasConfig(domains) : undefined
}

async function getAliasConfig(domains: string[]) {
  const acm = new ACM({ region: 'us-east-1' })
  const params = { CertificateStatuses: ['ISSUED'] }
  const response = await acm.listCertificates(params).promise()
  const certList = (response && response.CertificateSummaryList) || []
  const certArns = certList.map(cert => cert.CertificateArn)
  const arns = certArns.filter(arn => arn !== undefined) as string[]
  const arnsWithSchemata = await Promise.all(arns.map(getCertificateDomains))
  return lib.findAliasConfig(arnsWithSchemata, domains)
}

async function getCertificateDomains(acmCertRef: string) {
  const acm = new ACM({ region: 'us-east-1' })
  const params = { CertificateArn: acmCertRef }
  const cert = (await acm.describeCertificate(params).promise()).Certificate
  const names = (cert && cert.SubjectAlternativeNames) || []
  return { acmCertRef, names }
}

async function getAccountId(accountId?: string) {
  return accountId || (await new STS().getCallerIdentity().promise()).Account
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
