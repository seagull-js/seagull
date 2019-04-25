import { ACM, config } from 'aws-sdk'

import { findAliasConfig } from '../lib'

export async function checkForAliasConfig(pkgJson: any, handler: ACMHandler) {
  const domains: string[] = pkgJson.seagull && pkgJson.seagull.domains
  const needAliases = domains && domains.length > 0
  return needAliases ? await getAliasConfig(domains, handler) : undefined
}

async function getAliasConfig(domains: string[], handler: ACMHandler) {
  const arns = await handler.listCertificates()
  const getArnDomains = async (arn: string) => getCertDomains(arn, handler)
  const arnsWithSchemata = await Promise.all(arns.map(getArnDomains))
  return findAliasConfig(arnsWithSchemata, domains)
}

async function getCertDomains(acmCertRef: string, handler: ACMHandler) {
  return { acmCertRef, names: await handler.describeCertificate(acmCertRef) }
}

export class ACMHandler {
  private acm: ACM

  constructor() {
    const credentials = config.credentials
    this.acm = new ACM({ credentials, region: 'us-east-1' })
  }

  async listCertificates() {
    const params = { CertificateStatuses: ['ISSUED'] }
    const response = await this.acm.listCertificates(params).promise()
    const certSumList = (response && response.CertificateSummaryList) || []
    const arns = certSumList.map(certSum => certSum && certSum.CertificateArn)
    return arns.filter(arn => arn !== undefined) as string[]
  }

  async describeCertificate(acmCertRef: string) {
    const params = { CertificateArn: acmCertRef }
    const description = await this.acm.describeCertificate(params).promise()
    const cert = description.Certificate
    return (cert && cert.SubjectAlternativeNames) || []
  }
}
