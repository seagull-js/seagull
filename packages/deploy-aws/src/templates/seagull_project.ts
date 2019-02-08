import { SDK } from 'aws-cdk'
import { STS } from 'aws-sdk'

import * as lib from '../lib'
import { SeagullApp } from '../seagull_app'
import { setCredsByProfile } from '../set_aws_credentials'

interface SeagullProjectProps {
  appPath: string
  branch: string
  mode: string
  profile: string
  region: string
}

export class SeagullProject {
  appPath: string
  branch: string
  mode: string
  profile: string
  region: string

  constructor(props: SeagullProjectProps) {
    this.appPath = props.appPath
    this.branch = props.branch
    this.mode = props.mode
    this.profile = props.profile
    this.region = props.region
  }

  async createSeagullApp() {
    await this.validate()
    // preparations for deployment
    const suffix = this.mode === 'test' ? `${this.branch}-test` : ''
    const name = `${require(`${this.appPath}/package.json`).name}${suffix}`
    const sdk = new SDK({})
    const account = await sdk.defaultAccount()
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
    const stackProps = { env: { account, region: this.region } }
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

  async deployProject() {
    const app = await this.createSeagullApp()
    await app.deployStack()
  }

  async diffProject() {
    const app = await this.createSeagullApp()
    await app.diffStack()
  }

  async validate() {
    const hasValidProfile = setCredsByProfile(this.profile)
    const throwError = () => {
      throw new Error('Validation Error!')
    }
    return !hasValidProfile ? throwError() : ''
  }
}
