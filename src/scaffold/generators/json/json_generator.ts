/** @module Scaffold */
import { writeFile } from '../../../tools/util'

/**
 * Common Functionality for reading and generating JSON files
 */
export class JsonGenerator {
  protected file: any

  constructor() {
    this.file = {}
  }

  /**
   * directy access the value of a given key
   *
   * @param key what to access
   */
  get(key: string): any {
    return this.file[key]
  }

  /**
   * directly set the value of a given key
   *
   * @param key identifier
   * @param value payload
   */
  set(key: string, value: any): this {
    this.file[key] = value
    return this
  }

  /**
   * update a given key/value with access to the current value
   *
   * @param key what to update
   * @param fn callback receiving the current value
   */
  update(key: string, fn: (value: any) => any): this {
    fn(this.file[key])
    return this
  }

  /**
   * remove a key and it's values from the JSON object
   *
   * @param key what to remove
   */
  unset(key: string): this {
    delete this.file[key]
    return this
  }

  /**
   * Replaces the current state completely with an external JSON file
   *
   * @param filePath absolute path to a JSON file for loading
   */
  fromFile(filePath: string): this {
    this.file = require(filePath)
    return this
  }

  /**
   * Replaces the current state completely with an external JSON string
   *
   * @param source string with json contents
   */
  fromString(source: string): this {
    this.file = JSON.parse(source)
    return this
  }

  /**
   * Return pretty formatted JSON string
   */
  toString(): string {
    return JSON.stringify(this.file, null, 2)
  }

  /**
   * Write the current AST directly to a file, overwrite if file already exists.
   *
   * @param filePath absolute path where the file will get written
   */
  toFile(filePath: string): void {
    writeFile(filePath, this.toString())
  }

  /**
   * get the file contents as a raw javascript object for direct use
   */
  toObject() {
    return this.file
  }
}
