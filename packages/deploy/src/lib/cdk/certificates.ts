import * as CM from '@aws-cdk/aws-certificatemanager'
import { Construct } from '@aws-cdk/cdk'
import * as ACM from 'aws-sdk/clients/acm'
import { GetCertificateDomains, GetRelevantCertList } from '../../commands'

export const addNewCert = (
  stack: Construct,
  name: string,
  domains: string[]
) => {
  const domainName = domains[0]
  const altNames = domains.slice(1)
  const subjectAlternativeNames = altNames.length ? altNames : undefined
  const props: CM.CertificateProps = { domainName, subjectAlternativeNames }
  return new CM.Certificate(stack, `${name}Certificate`, props).certificateArn
}
const noCertFound = `No Certificate found, that matches all domains. Make sure 
 to request a Certificate via ACM & confirm the Mail! Cannot deploy stack.`
const throwCertError = () => {
  throw new Error(noCertFound)
}
export const makeAliasConfig = async (domains?: string[]) => {
  const names = domains
  if (!names || !names.length) {
    return undefined
  }
  const acmCertRef = await getExistingCert(names)
  return acmCertRef ? { acmCertRef, names } : throwCertError()
}

export const getExistingCert = async (domains: string[]) => {
  const certSummaries = await new GetRelevantCertList().execute()
  const domainListRequests = certSummaries.map(makeDomainListRequest())
  const domainLists = await Promise.all(domainListRequests)
  const certIndex = domainLists.findIndex(matchesDomains(domains))
  return certIndex < 0 ? undefined : certSummaries[certIndex].CertificateArn
}

const makeDomainListRequest = () => (summary: ACM.CertificateSummary) =>
  new GetCertificateDomains(summary.CertificateArn!).execute()

export const matchesDomains = (domains: string[]) => (
  domainSchemata: string[]
) => {
  const atLeastOneDidNotMatch =
    domains.findIndex(isNotMatchedBy(domainSchemata)) >= 0
  return !atLeastOneDidNotMatch
}
export const isNotMatchedBy = (domainSchemata: string[]) => (domain: string) =>
  domainSchemata.findIndex(domainMatch(domain)) < 0

export const domainMatch = (domain: string) => (schema: string) => {
  if (!schema.includes('*')) {
    return schema === domain
  }
  const regExp = schema.replace(/\./g, '\\.').replace(/\*/g, '[^ ]*') + '\\b'
  return !!domain.match(regExp)
}
