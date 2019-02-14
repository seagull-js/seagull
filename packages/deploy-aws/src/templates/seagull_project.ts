import { SDK } from 'aws-cdk'
import { ACM, STS } from 'aws-sdk'

import { FS } from '@seagull/commands-fs'

import * as lib from '../lib'
import { ProvideAssetFolder } from '../provide_asset_folder'
import { SeagullApp } from '../seagull_app'
import { setCredsByProfile } from '../set_aws_credentials'

interface SeagullProjectProps {
  accountId?: string
  appPath: string
  branch: string
  mode: string
  noValidation: boolean
  profile: string
  region: string
}

export class SeagullProject {
  accountId?: string
  appPath: string
  branch: string
  mode: string
  noValidation: boolean
  profile: string
  region: string

  constructor(props: SeagullProjectProps) {
    this.accountId = props.accountId
    this.appPath = props.appPath
    this.branch = props.branch
    this.mode = props.mode
    this.noValidation = props.noValidation
    this.profile = props.profile
    this.region = props.region
  }

  async createSeagullApp() {
    // preparations for deployment
    const suffix = this.mode === 'test' ? `${this.branch}-test` : ''
    const pkgJson = require(`${this.appPath}/package.json`)
    const name = `${pkgJson.name}${suffix}`
    const sdk = new SDK({})
    const account = await sdk.defaultAccount()
    const accountId = getAccountId(this.accountId)
    const itemBucketName = `${this.region}-${accountId}-${name}-items`
    const s3DeployNeeded = this.mode === 'true' || this.branch === 'master'
    const actions: string[] = []
    actions.push('sts:AssumeRole')
    actions.push('logs:CreateLogStream')
    actions.push('logs:PutLogEvents')
    actions.push('lambda:InvokeFunction')
    actions.push('lambda:InvokeAsync')
    actions.push('s3:*')
    const addAssets = true
    const appPath = this.appPath
    const itemsBucket = itemBucketName
    const projectName = name
    const stackProps = { env: { account, region: this.region } }
    const props = { addAssets, appPath, itemsBucket, projectName, stackProps }

    const domains: string[] = pkgJson.seagull && pkgJson.seagull.domains
    // create the asset folder
    await addResources(this.appPath, itemsBucket)

    // construct the stack and the app
    const app = new SeagullApp(props)
    const role = app.stack.addIAMRole('role', 'lambda.amazonaws.com', actions)
    const lambda = app.stack.addUniversalLambda('lambda', this.appPath, role)
    const apiGateway = app.stack.addUniversalApiGateway('api-gateway', lambda)
    const needAliases = domains && domains.length > 0
    const aliasConfig = needAliases ? await getAliasConfig(domains) : undefined
    app.stack.addCloudfront('cloudfront', { apiGateway, aliasConfig })
    s3DeployNeeded ? app.stack.addS3(itemBucketName, role) : lib.noS3Deploy()

    return app
  }

  async deployProject() {
    // tslint:disable-next-line:no-unused-expression
    this.noValidation ? lib.noValidation() : await this.validate()
    const app = await this.createSeagullApp()
    await app.deployStack()
  }

  async diffProject() {
    const app = await this.createSeagullApp()
    await app.diffStack()
  }

  async validate() {
    const hasValidProfile = setCredsByProfile(this.profile)
    if (!hasValidProfile) {
      throw new Error('Validation Error!')
    }
    return
  }
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
