/** @module Scaffold */
import { join } from 'path'
import { AtomGenerator, AtomTestGenerator } from '../generators'
import { Plan } from './plan'

export class AtomPlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    this.structure = {
      [`./frontend/atoms/${name}.tsx`]: AtomGenerator(name),
      [`./test/frontend/atoms/${name}.tsx`]: AtomTestGenerator(name),
    }
  }
}
