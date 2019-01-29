import * as cdk from 'aws-cdk'

import { CDKAction, Options } from './cdk_action'

export class Deploy extends CDKAction {
  constructor(appPath: string, opts: Options) {
    super(appPath, opts)
  }

  async execute() {
    return (await this.validate()) && (await this.deployApp())
  }

  private async deployApp() {
    await this.provideAssetFolder()
    await this.createCDKApp()
    await this.deployCDKApp()
    return true
  }

  private async deployCDKApp() {
    const env = this.synthStack.environment
    const toolkitInfo = await cdk.loadToolkitInfo(env, this.sdk, 'CDKToolkit')
    await cdk.bootstrapEnvironment(env, this.sdk, 'CDKToolkit', undefined)
    const stack = this.synthStack
    await cdk.deployStack({ sdk: this.sdk, stack, toolkitInfo })
    return true
  }
}
