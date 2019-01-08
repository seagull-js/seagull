import * as yaml from 'yaml'

import * as cfnDiff from '@aws-cdk/cloudformation-diff'

import { CDKAction, Options } from './cdk_action'
import { noChangesInDiff } from './lib'

export class Diff extends CDKAction {
  private diff: cfnDiff.TemplateDiff

  constructor(appPath: string, opts: Options) {
    super(appPath, opts)
    this.diff = {} as cfnDiff.TemplateDiff
  }

  async execute() {
    return (await this.validate()) && (await this.diffApp())
  }

  private async diffApp() {
    await this.createCDKApp()
    const currTemplate = await this.readCurrentTemplate()
    this.diff = cfnDiff.diffTemplate(currTemplate, this.synthStack.template)
    await this.printDiff()
    return true
  }

  private async readCurrentTemplate() {
    const cfn = await this.sdk.cloudFormation(this.synthStack.environment, 0)
    const templateData = { StackName: this.synthStack.name }
    const template = await cfn.getTemplate(templateData).promise()
    const body = template.TemplateBody
    return (body && yaml.parse(body, { schema: 'yaml-1.1' })) || {}
  }

  private async printDiff() {
    return this.diff.isEmpty ? noChangesInDiff() : this.printChanges()
  }

  private async printChanges() {
    cfnDiff.formatDifferences(process.stdout, this.diff, this.logicalToPathMap)
    return true
  }
}
