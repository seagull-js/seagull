import { Command } from '@seagull/commands'
import { SharedIniFileCredentials } from 'aws-sdk'
import * as ACM from 'aws-sdk/clients/acm'
export class GetCertificateDomains extends Command {
  private acm: ACM
  private arn: string
  constructor(arn: string) {
    super()
    const credentials = new SharedIniFileCredentials({
      profile: process.env.AWS_PROFILE,
    })
    this.acm = new ACM({ credentials, region: 'us-east-1' })
    this.arn = arn
  }
  async execute() {
    const detailedCert = await this.getCertificate()
    if (!detailedCert) {
      return []
    }
    const altNames = detailedCert.SubjectAlternativeNames || []
    return altNames
  }
  async revert() {
    return true
  }
  async getCertificate() {
    const params = { CertificateArn: this.arn }
    try {
      const response = await this.acm.describeCertificate(params).promise()
      return response.Certificate
    } catch (err) {
      // tslint:disable-next-line:no-console
      console.error(err)
      return undefined
    }
  }
}
