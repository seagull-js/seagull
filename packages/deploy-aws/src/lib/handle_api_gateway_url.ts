export function getApiGatewayDomain(url: string): string {
  const urlhasProt = url.indexOf('://') > -1
  const noProt = urlhasProt ? url.substring(url.indexOf('://') + 3) : url
  return noProt.substring(0, noProt.indexOf('/'))
}

export function getApiGatewayPath(url: string): string {
  const noSlashAtEnd = url.endsWith('/') ? url.slice(0, -1) : url
  const noProtocolUrl = noSlashAtEnd.substring(url.indexOf('://') + 3)
  return noProtocolUrl.substring(noProtocolUrl.indexOf('/'))
}
