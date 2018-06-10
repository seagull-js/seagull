/** @module Scaffold */
import { writeFile } from '../../../tools/util'

/**
 * Custom generator for plain text files
 */
export class TextGenerator {
  constructor(public content: string = '') {}

  /**
   * Return pretty formatted string
   */
  toString(): string {
    return this.content
  }

  /**
   * Write the current AST directly to a file, overwrite if file already exists.
   *
   * @param filePath absolute path where the file will get written
   */
  toFile(filePath: string): void {
    writeFile(filePath, this.toString())
  }
}
