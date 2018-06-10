/** @module Scaffold */
import { mkdirSync, writeFileSync } from 'fs'
import { toPairs } from 'lodash'
import { join } from 'path'
import * as shell from 'shelljs'
import * as Gen from './'

shell.config.silent = true

export class App {
  dir: { [file: string]: string }

  constructor(private name: string, seagullVersion: string = '0.1.0') {
    const dir: any = {}
    dir['package.json'] = Gen.JsonPackage(name, seagullVersion)
    dir['tsconfig.json'] = Gen.JsonTsconfig()
    dir['tslint.json'] = Gen.JsonTslint()
    dir['frontend/pages/index.tsx'] = Gen.Page('HelloPage', {
      path: '/',
    })
    this.dir = dir
  }

  toFolder(path: string) {
    this.createFolderStructure(path)
    // this.copyExampleAssetFile(path)
    toPairs(this.dir).forEach(([file, text]) => {
      writeFileSync(join(path, file), text)
    })
  }

  createFolderStructure(path: string) {
    mkdirSync(path)
    mkdirSync(join(path, 'backend'))
    mkdirSync(join(path, 'backend', 'api'))
    mkdirSync(join(path, 'frontend'))
    mkdirSync(join(path, 'frontend/pages'))
    mkdirSync(join(path, 'frontend/assets'))
    mkdirSync(join(path, 'frontend/assets/favicons'))
  }
}
