/** @module Tools */
import * as fs from 'fs'

/**
 * write a file and ensure all intermediate folders exist
 */
export function writeFile(filePath: string, content: string | Buffer) {
  const fragments = filePath.split('/')
  fragments.pop()
  const folder = fragments.join('/')
  require('mkdirp').sync(folder)
  fs.writeFileSync(filePath, content)
}