/** @module Tools */
import Watcher from './watcher'
import * as Workers from './workers'

export interface IStrategies {
  [name: string]: (watcher: Watcher) => Workers.Worker[]
}

export const strategies: IStrategies = {
  default: watcher => [
    new Workers.Compiler(watcher.srcFolder),
    new Workers.HTTPServer(watcher.srcFolder, 8080),
  ],
  // default: [],
}
