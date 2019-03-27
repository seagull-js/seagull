import { ACM, CloudFront } from 'aws-sdk'

import { findAliasConfig } from '../lib'

export async function getCFURL(name: string, handler: CloudfrontHandler) {
  const cloudfronts = await handler.listDistributions()
  const cloudfront = cloudfronts.find(dist => dist.Comment === name)
  return cloudfront && cloudfront.DomainName
}

export class CloudfrontHandler {
  private cloudfront: CloudFront

  constructor() {
    this.cloudfront = new CloudFront()
  }

  async listDistributions() {
    const cloudfronts = await this.cloudfront.listDistributions().promise()
    const distributionList = cloudfronts.DistributionList
    return (distributionList && distributionList.Items) || []
  }
}
