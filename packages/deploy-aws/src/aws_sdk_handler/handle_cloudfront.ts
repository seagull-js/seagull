import { CloudFront, config } from 'aws-sdk'

export async function getCFURL(name: string, handler: CloudfrontHandler) {
  const cloudfronts = await handler.listDistributions()
  const cloudfront = cloudfronts.find(dist => dist.Comment === name)
  return cloudfront && cloudfront.DomainName
}

export class CloudfrontHandler {
  private cloudfront: CloudFront

  constructor() {
    const { credentials, region } = config
    this.cloudfront = new CloudFront({ credentials, region })
  }

  async listDistributions() {
    const cloudfronts = await this.cloudfront.listDistributions().promise()
    const distributionList = cloudfronts.DistributionList
    return (distributionList && distributionList.Items) || []
  }
}
