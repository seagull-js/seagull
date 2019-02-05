import { STS } from 'aws-sdk'

import * as lib from '../lib'
import { SeagullApp } from '../seagull_app'

interface SeagullProjectProps {
  account: string
  appPath: string
  branch: string
  mode: string
  region: string
}

export class SeagullProject {
  account: string
  appPath: string
  branch: string
  mode: string
  region: string

  constructor(props: SeagullProjectProps) {
    this.account = props.account
    this.appPath = props.appPath
    this.branch = props.branch
    this.mode = props.mode
    this.region = props.region
  }

  async createSeagullApp() {
    // preparations for deployment
    const suffix = this.mode === 'test' ? `${this.branch}-test` : ''
    const name = `${require(`${this.appPath}/package.json`).name}${suffix}`
    const accountId = (await new STS().getCallerIdentity().promise()).Account
    const bucketProps = { accountId, project: name, region: this.region }
    const itemBucketName = lib.getItemsBucketName(bucketProps)
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
    const stackProps = { env: { account: this.account, region: this.region } }
    const props = { addAssets, appPath, itemsBucket, projectName, stackProps }

    // construct the stack and the app
    const app = new SeagullApp(props)
    const role = app.stack.addIAMRole('role', 'lambda.amazonaws.com', actions)
    const lambda = app.stack.addUniversalLambda('lambda', this.appPath, role)
    const apiGateway = app.stack.addUniversalApiGateway('api-gateway', lambda)
    app.stack.addCloudfront('cloudfront', apiGateway)
    s3DeployNeeded ? app.stack.addS3(itemBucketName, role) : lib.noS3Deploy()

    return app
  }

  async deploy() {
    const app = await this.createSeagullApp()
    await app.deployStack()
  }

  async diff() {
    const app = await this.createSeagullApp()
    await app.diffStack()
  }
}
