import { Command } from '@seagull/commands'
import { SharedIniFileCredentials } from 'aws-sdk'
import * as ACM from 'aws-sdk/clients/acm'
export class GetRelevantCertList extends Command {
  private acm: ACM

  constructor(region: string) {
    super()
    const credentials = new SharedIniFileCredentials({
      profile: process.env.AWS_PROFILE,
    })
    this.acm = new ACM({ credentials, region })
  }
  async execute() {
    return await this.getCertList()
  }
  async revert() {
    return true
  }
  async getCertList() {
    const params = { CertificateStatuses: ['ISSUED'] }
    try {
      const response = await this.acm.listCertificates(params).promise()
      return response.CertificateSummaryList || []
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error(err)
      return []
    }
  }
}
