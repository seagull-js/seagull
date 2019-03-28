import { STS } from 'aws-sdk'

export async function getAccountId(handler: STSHandler) {
  return await handler.getAccountId()
}

export class STSHandler {
  private sts: STS

  constructor() {
    this.sts = new STS()
  }

  async getAccountId() {
    const identity = await this.sts.getCallerIdentity().promise()
    return identity.Account
  }
}
