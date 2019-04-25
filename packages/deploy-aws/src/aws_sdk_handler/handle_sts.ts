import { config, STS } from 'aws-sdk'

export async function getAccountId(handler: STSHandler) {
  return await handler.getAccountId()
}

export class STSHandler {
  private sts: STS

  constructor() {
    const { credentials, region } = config
    this.sts = new STS({ credentials, region })
  }

  async getAccountId() {
    const identity = await this.sts.getCallerIdentity().promise()
    return identity.Account
  }
}
