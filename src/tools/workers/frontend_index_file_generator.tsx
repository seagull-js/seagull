/** @module Tools */
import { join, relative } from 'path'
import {
  FrontendIndexGenerator,
  TsconfigJsonGenerator,
} from '../../scaffold/generators'
import {} from '../../scaffold/generators'
import { listFiles, transpileCode } from '../util'
import { IWorker } from './interface'

/**
 * Generate a basic index.html file for a "dumb" single-page-app webserver that
 * does not need SSR at all.
 */
export class FrontendIndexFileGenerator implements IWorker {
  constructor(public srcFolder: string) {}

  async watcherWillStart() {
    this.regenerate()
  }

  async onFileEvent(filePath: string) {
    this.regenerate()
  }

  regenerate() {
    const frontendFolderPath = join(this.srcFolder, 'frontend')
    const pages = this.analyzePages(frontendFolderPath)
    const gen = FrontendIndexGenerator(pages)
    const text = gen.toString()
    const filePath = join(this.srcFolder, '.seagull/dist/frontend/index.js')
    const cfg = TsconfigJsonGenerator().toObject()
    try {
      transpileCode(text, filePath, cfg)
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log('REGENERATE: ', error)
    }
  }

  analyzePages(frontendFolderPath: string) {
    const files = listFiles(`${frontendFolderPath}/pages`)
    return files
      .filter(file => /tsx$/.test(file))
      .map(file => relative(this.srcFolder, file))
      .map(file => file.replace('.tsx', ''))
      .map(file => file.replace('frontend', '.'))
  }
}
