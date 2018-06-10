/** @module Scaffold */

export interface IGenerator {
  toFile: (filePath: string) => void
}

export class Plan {
  structure: { [filePath: string]: IGenerator } = {}
  srcFolder: string

  constructor(srcFolder: string) {
    this.srcFolder = srcFolder
  }

  apply() {
    const filePaths = Object.keys(this.structure)
    filePaths.forEach(filePath => this.structure[filePath].toFile(filePath))
  }
}
