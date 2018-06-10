/** @module Scaffold */
import { join } from 'path'
import { AtomGenerator } from '../generators'
import { Plan } from './plan'

export class AtomPlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    const atomPathRelative = `frontend/components/atoms/${name}.tsx`
    const atomPath = join(this.srcFolder, atomPathRelative)
    const atomGenerator = AtomGenerator(name)
    this.structure = {}
    this.structure[atomPath] = atomGenerator
  }
}
