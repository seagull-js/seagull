import * as YAML from 'yamljs'
import {
  IFunction,
  IIAMRoleStatement,
  IProvider,
  IServerless,
} from './interfaces'

export default class Builder {
  private data: IServerless

  constructor(name: string) {
    this.data = this.createDefaultServerless()
    this.data.service = name
  }

  addIAMRoleStatement(item: IIAMRoleStatement): Builder {
    this.data.provider.iamRoleStatements.push(item)
    return this
  }

  addPlugin(item: string): Builder {
    this.data.plugins.push(item)
    return this
  }

  addFunction(name, fn: IFunction): Builder {
    this.data.functions[name] = fn
    return this
  }

  toYAML(): string {
    return YAML.stringify(this.data, 4)
  }

  private createDefaultServerless(): IServerless {
    return {
      frameworkVersion: '=1.19.0',
      functions: {},
      plugins: [],
      provider: this.createDefaultProvider(),
      service: '',
    }
  }

  private createDefaultProvider(): IProvider {
    return {
      iamRoleStatements: [],
      name: 'aws',
      region: 'eu-central-1',
      runtime: 'nodejs6.10',
      stage: 'dev',
      timeout: 30,
    }
  }
}
