/** @module Scaffold */
import { join } from 'path'

export interface IGenerator {
  toFile: (filePath: string) => void
}

export class Plan {
  prefix: string = ''
  srcFolder: string
  structure: { [filePath: string]: IGenerator } = {}

  constructor(srcFolder: string) {
    this.srcFolder = srcFolder
  }

  apply() {
    const files = Object.keys(this.structure)
    const path = (file: string) => join(this.srcFolder, this.prefix, file)
    files.forEach(file => this.structure[file].toFile(path(file)))
  }
}
