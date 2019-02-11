import { App, StackProps } from '@aws-cdk/cdk'
import * as cfnDiff from '@aws-cdk/cloudformation-diff'
import * as cdk from 'aws-cdk'
import * as yaml from 'yaml'

import * as lib from './lib'
import { SeagullStack } from './seagull_stack'

interface OperationsProps {
  projectName: string
  stackProps?: StackProps
}

export class SeagullApp extends App {
  stack: SeagullStack
  private projectName: string

  constructor(props: OperationsProps) {
    super()
    const { projectName, stackProps } = props
    this.projectName = projectName
    this.stack = new SeagullStack(this, projectName, stackProps)
  }

  async deployStack() {
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
