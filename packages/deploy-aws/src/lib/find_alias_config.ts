export interface SchemaArn {
  acmCertRef: string
  names: string[]
}

export function findAliasConfig(arns: SchemaArn[], domains: string[]) {
  return arns.find(schemaArn => !!findSchemaArn(schemaArn, domains))
}

function findSchemaArn({ names }: SchemaArn, domains: string[]) {
  return domains.find(domain => findNoMatchDomain(domain, names)) === undefined
}

function findNoMatchDomain(domain: string, schemata: string[]) {
  return schemata.find(schema => domainMatch(domain, schema)) === undefined
}

function domainMatch(domain: string, schema: string) {
  const regExp = `^${schema.replace(/\./g, '\\.').replace(/\*/g, '[^ ]*')}\\b`
  return schema === domain || domain.match(regExp) !== null
}
