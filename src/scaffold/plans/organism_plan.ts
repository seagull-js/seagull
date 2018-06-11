/** @module Scaffold */
import { OrganismGenerator, OrganismTestGenerator } from '../generators'
import { Plan } from './plan'

export class OrganismPlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    this.structure = {
      [`./frontend/organisms/${name}.tsx`]: OrganismGenerator(name),
      [`./test/frontend/organisms/${name}.tsx`]: OrganismTestGenerator(name),
    }
  }
}
