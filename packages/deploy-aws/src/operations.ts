import { App, StackProps } from '@aws-cdk/cdk'
import * as cfnDiff from '@aws-cdk/cloudformation-diff'
import * as cdk from 'aws-cdk'
import * as yaml from 'yaml'

import { FS } from '@seagull/commands-fs'

import * as lib from './lib'
import { ProvideAssetFolder } from './provide_asset_folder'
import { SeagullStack } from './seagull_stack'

interface OperationsProps {
  addAssets?: boolean
  appPath: string
  itemsBucket?: string
  projectName: string
  stackEnv?: StackProps
}

export class Operations {
  stack: SeagullStack

  private addAssets: boolean
  private app: App
  private appPath: string
  private itemsBucket?: string
  private projectName: string

  constructor(props: OperationsProps) {
    this.addAssets = props.addAssets === true
    this.app = new App()
    this.appPath = props.appPath
    this.itemsBucket = props.itemsBucket
    this.projectName = props.projectName
    this.stack = new SeagullStack(this.app, props.projectName, props.stackEnv)
  }

  async deployStack() {
    // tslint:disable-next-line:no-unused-expression
    this.addAssets && (await this.addResources())
    // TODO: add provideAssetFolder
    const sdk = new cdk.SDK({})
    const synthStack = this.app.synthesizeStack(this.projectName)
    const env = synthStack.environment
    const toolkitInfo = await cdk.loadToolkitInfo(env, sdk, 'CDKToolkit')
    await cdk.bootstrapEnvironment(env, sdk, 'CDKToolkit', undefined)
    await cdk.deployStack({ sdk, stack: synthStack, toolkitInfo })
  }

  async diffStack() {
    const sdk = new cdk.SDK({})
    const synthStack = this.app.synthesizeStack(this.projectName)
    const cfn = await sdk.cloudFormation(synthStack.environment, 0)
    const templateData = { StackName: synthStack.name }
    const template = await cfn.getTemplate(templateData).promise()
    const body = template.TemplateBody
    const curTemplate = (body && yaml.parse(body, { schema: 'yaml-1.1' })) || {}
    const logicalToPathMap = lib.createLogicalToPathMap(synthStack)
    const diff = cfnDiff.diffTemplate(curTemplate, synthStack.template)
    // tslint:disable-next-line:no-unused-expression
    diff.isEmpty && lib.noChangesInDiff()
    cfnDiff.formatDifferences(process.stdout, diff, logicalToPathMap)
  }

  private async addResources() {
    const provideAssetFolder = new ProvideAssetFolder(this.appPath)
    await provideAssetFolder.execute()
    const replaceItemBucketName = this.itemsBucket !== undefined
    return replaceItemBucketName && (await this.replaceS3BucketName())
  }

  private async replaceS3BucketName() {
    const lambdaPath = `.seagull/deploy/dist/assets/backend/lambda.js`
    const lambdaFile = `${this.appPath}/${lambdaPath}`
    const lambda = await new FS.ReadFile(lambdaFile).execute()
    const lambdaWithBucketName = lambda.replace('demo-bucket', this.itemsBucket)
    await new FS.WriteFile(lambdaFile, lambdaWithBucketName).execute()
  }
}
