import { MetadataEntry, SynthesizedStack } from '@aws-cdk/cx-api'

interface PathMap {
  [id: string]: string
}

export function createLogicalToPathMap(stack: SynthesizedStack) {
  const map: PathMap = {}
  const data = stack.metadata
  const dataKeys = Object.keys(data)
  dataKeys.forEach(key => data[key].forEach(entry => addEntry(map, entry, key)))
  return map
}

function addEntry(map: PathMap, entry: MetadataEntry, key: string): void {
  // tslint:disable-next-line:no-unused-expression
  entry.type === 'aws:cdk:logicalId' && entry.data && (map[entry.data] = key)
}
