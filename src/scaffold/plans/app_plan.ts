/** @module Scaffold */
import * as fs from 'fs'
import { join } from 'path'
import * as Gen from '../generators'
import { Plan } from './plan'

export type AppMode = 'static'

export class AppPlan extends Plan {
  constructor(srcFolder: string, public name: string, public mode: AppMode) {
    super(srcFolder)
    this.prefix = name
    switch (this.mode) {
      case 'static':
        this.modeStatic()
    }
  }

  private modeStatic() {
    this.structure = {
      './frontend/atoms/index.ts': Gen.EmptyTextGenerator(),
      './frontend/index.ts': Gen.EmptyTextGenerator(),
      '.gitignore': Gen.GitignoreTextGenerator(),
      'package.json': Gen.PackageJsonGenerator(this.name, this.getVersion()),
      'tsconfig.json': Gen.TsconfigJsonGenerator(),
      'tslint.json': Gen.TslintJsonGenerator(),
    }
  }

  // breaks when unit-testing within 'mock-fs', so return a sensible default
  private getVersion(): string {
    const pkgPath = join(__dirname, '../../../../package.json')
    return fs.existsSync(pkgPath) ? require(pkgPath).version : '*'
  }
}
