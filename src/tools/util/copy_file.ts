/** @module Tools */
import * as fs from 'fs'

/**
 * copy a file synchronously from one place to another.
 *
 * @param from source location
 * @param to target location
 */
export function copyFile(from: string, to: string) {
  fs.writeFileSync(to, fs.readFileSync(from))
}
