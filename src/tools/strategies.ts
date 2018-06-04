/** @module Tools */
import Watcher from './watcher'
import * as Workers from './workers'

export interface IStrategies {
  [name: string]: (watcher: Watcher) => Workers.IWorker[]
}

export const strategies: IStrategies = {
  default: watcher => [
    new Workers.IndexFileGenerator(watcher.srcFolder),
    new Workers.Compiler(watcher.srcFolder),
    new Workers.HTTPServer(watcher.srcFolder, 8080),
  ],
}
