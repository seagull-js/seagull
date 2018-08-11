/** @module Tools */
import Watcher from './watcher'
import * as Workers from './workers'

export interface IStrategies {
  [name: string]: (watcher: Watcher) => Workers.IWorker[]
}

export const strategies: IStrategies = {
  default: watcher => [
    new Workers.CopyFragments(watcher.srcFolder),
    new Workers.Compiler(watcher.srcFolder),
    new Workers.FrontendIndexFileGenerator(watcher.srcFolder),
    new Workers.IndexFileGenerator(watcher.srcFolder),
    new Workers.Bundler(watcher.srcFolder),
    new Workers.HTTPServer(watcher.srcFolder, 'static', 8080),
  ],
}
