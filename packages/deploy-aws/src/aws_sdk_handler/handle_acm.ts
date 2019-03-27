import { ACM } from 'aws-sdk'

import { findAliasConfig } from '../lib'

export async function checkForAliasConfig(pkgJson: any, handler: ACMHandler) {
  const domains: string[] = pkgJson.seagull && pkgJson.seagull.domains
  const needAliases = domains && domains.length > 0
  return needAliases ? await getAliasConfig(domains, handler) : undefined
}

async function getAliasConfig(domains: string[], handler: ACMHandler) {
  const certArns = await handler.listCertificates()
  const arns = certArns.filter(arn => arn !== undefined) as string[]
  const getArnDomains = (arn: string) => getCertificateDomains(arn, handler)
  const arnsWithSchemata = await Promise.all(arns.map(getArnDomains))
  return findAliasConfig(arnsWithSchemata, domains)
}

async function getCertificateDomains(acmCertRef: string, handler: ACMHandler) {
  return { acmCertRef, names: await handler.describeCertificate(acmCertRef) }
}

export class ACMHandler {
  private acm: ACM

  constructor() {
    this.acm = new ACM({ region: 'us-east-1' })
  }

  async listCertificates() {
    const params = { CertificateStatuses: ['ISSUED'] }
    const response = await this.acm.listCertificates(params).promise()
    return (response && response.CertificateSummaryList) || []
  }

  async describeCertificate(acmCertRef: string) {
    const params = { CertificateArn: acmCertRef }
    const description = await this.acm.describeCertificate(params).promise()
    const cert = description.Certificate
    return (cert && cert.SubjectAlternativeNames) || []
  }
}
