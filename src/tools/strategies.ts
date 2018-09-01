/** @module Tools */
import Watcher from './watcher'
import * as Workers from './workers'

export interface IStrategies {
  [name: string]: (watcher: Watcher) => Workers.IWorker[]
}

export const strategies: IStrategies = {
  /**
   * only create a fresh `.seagull` folder from scratch from the codebase
   */
  build: watcher => [
    new Workers.CopyFragments(watcher.srcFolder),
    new Workers.Compiler(watcher.srcFolder),
    new Workers.FrontendIndexFileGenerator(watcher.srcFolder),
    new Workers.IndexFileGenerator(watcher.srcFolder),
    new Workers.Bundler(watcher.srcFolder),
  ],

  /**
   * build a fresh `.seagull` folder from scratch and start an HTTP server
   */
  default: watcher => [
    new Workers.CopyFragments(watcher.srcFolder),
    new Workers.Compiler(watcher.srcFolder),
    new Workers.FrontendIndexFileGenerator(watcher.srcFolder),
    new Workers.IndexFileGenerator(watcher.srcFolder),
    new Workers.Bundler(watcher.srcFolder),
    new Workers.HTTPServer(watcher.srcFolder, 'static', 8080),
  ],
}
