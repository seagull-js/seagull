import { CloudArtifact, MetadataEntry } from '@aws-cdk/cx-api'
import { Keymap as PathMap } from '../types'

export function createLogicalToPathMap(stack: CloudArtifact) {
  const map: PathMap = {}
  const data = stack.manifest.metadata
  if (!data) {
    return map
  }
  const dataKeys = Object.keys(data)
  dataKeys.forEach(key => data[key].forEach(entry => addEntry(map, entry, key)))
  return map
}

function addEntry(map: PathMap, entry: MetadataEntry, key: string): void {
  // tslint:disable-next-line:no-unused-expression
  entry.type === 'aws:cdk:logicalId' && entry.data && (map[entry.data] = key)
}
