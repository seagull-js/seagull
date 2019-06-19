import { SecretValue } from '@aws-cdk/cdk'
import { config, SSM } from 'aws-sdk'

import { GlobalConfigInstance } from 'aws-sdk/lib/config';
import * as lib from '../lib'
import { TokenParams } from '../types'

/**
 * method to create and/or retrieve an SSM secret from aws.
 *
 * @param params can be either a new token from command line or an already existing token
 **/
export async function handleSSMSecret(params: TokenParams) {
  const { ssmHandler, tokenName, token } = params
  if (tokenName === undefined) {
    lib.noGithubTokenFound()
    return { name: 'noToken', secret: new SecretValue('') }
  }
  // tslint:disable-next-line:no-unused-expression
  token && (await ssmHandler.createParameter(tokenName, token))
  const value = await ssmHandler.getParameter(tokenName)
  return { name: tokenName, secret: new SecretValue(value) }
}

export class SSMHandler {
  // tslint:disable-next-line: variable-name
  private _ssm: SSM | undefined
  private config: GlobalConfigInstance

  constructor() {
    this.config = config
  }

  async getParameter(ssmName: string) {
    const params = { Name: ssmName, WithDecryption: true }
    const ssmParam = await this.ssm.getParameter(params).promise()
    return (ssmParam && ssmParam.Parameter && ssmParam.Parameter.Value) || ''
  }

  async createParameter(name: string, value: string) {
    const type = 'SecureString'
    const params = { Name: name, Overwrite: true, Type: type, Value: value }
    await this.ssm.putParameter(params).promise()
  }


  private get ssm(): SSM {
    if (this._ssm) {
      return this._ssm
    }
    const { credentials, region } = this.config
    this._ssm = new SSM({ credentials, region })
    return this._ssm
  }
}
