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
  appPath?: string
  itemsBucket?: string
  projectName: string
  stack?: SeagullStack
  stackProps?: StackProps
}

export class SeagullApp extends App {
  stack: SeagullStack

  private addAssets: boolean
  private appPath?: string
  private itemsBucket?: string
  private projectName: string

  constructor(props: OperationsProps) {
    super()
    const { addAssets, appPath, itemsBucket, projectName, stackProps } = props
    this.addAssets = addAssets === true
    this.appPath = appPath
    this.itemsBucket = itemsBucket
    this.projectName = projectName
    this.stack = props.stack || new SeagullStack(this, projectName, stackProps)
  }

  async deployStack() {
    const path = this.appPath
    // tslint:disable-next-line:no-unused-expression
    this.addAssets && path && (await addResources(path, this.itemsBucket))
    const sdk = new cdk.SDK({})
    const synthStack = this.synthesizeStack(this.projectName)
    const env = synthStack.environment
    const toolkitInfo = await cdk.loadToolkitInfo(env, sdk, 'CDKToolkit')
    await cdk.bootstrapEnvironment(env, sdk, 'CDKToolkit', undefined)
    await cdk.deployStack({ sdk, stack: synthStack, toolkitInfo })
  }

  async diffStack() {
    const sdk = new cdk.SDK({})
    const synthStack = this.synthesizeStack(this.projectName)
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
