/** @module Tools */
import * as fs from 'fs'
import { flatten } from 'lodash'

/**
 * get a tree of files existing in the given source folder
 *
 * @param cwd root folder for walking down the tree
 */
export function listFiles(cwd: string): string[] {
  if (fs.lstatSync(cwd).isFile()) {
    return [cwd]
  } else {
    const names = fs.readdirSync(cwd)
    const list = names.map(f => listFiles(`${cwd}/${f}`))
    return flatten(list)
  }
}
