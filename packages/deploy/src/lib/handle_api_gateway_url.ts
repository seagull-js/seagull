export function getApiGatewayDomain(url: string): string {
  const noProtocolUrl = url.substring(url.indexOf('://') + 3)
  return noProtocolUrl.substring(0, noProtocolUrl.indexOf('/'))
}

export function getApiGatewayPath(url: string): string {
  const noSlashAtEnd = url.endsWith('/') ? url.slice(0, -1) : url
  const noProtocolUrl = noSlashAtEnd.substring(url.indexOf('://') + 3)
  return noProtocolUrl.substring(noProtocolUrl.indexOf('/'))
}
