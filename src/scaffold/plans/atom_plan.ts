/** @module Scaffold */
import { join } from 'path'
import { AtomGenerator } from '../generators'
import { Plan } from './plan'

export class AtomPlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    const atomPath = `./frontend/atoms/${name}.tsx`
    const atomGenerator = AtomGenerator(name)
    this.structure = {}
    this.structure[atomPath] = atomGenerator
  }
}
