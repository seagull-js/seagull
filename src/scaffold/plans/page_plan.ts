/** @module Scaffold */
import { PageGenerator, PageTestGenerator } from '../generators'
import { Plan } from './plan'

export class PagePlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    this.structure = {
      [`./frontend/pages/${name}.tsx`]: PageGenerator(name),
      [`./test/frontend/pages/${name}.tsx`]: PageTestGenerator(name),
    }
  }
}
