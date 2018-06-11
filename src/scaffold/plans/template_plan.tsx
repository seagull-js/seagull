/** @module Scaffold */
import { TemplateGenerator, TemplateTestGenerator } from '../generators'
import { Plan } from './plan'

export class TemplatePlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    this.structure = {
      [`./frontend/templates/${name}.tsx`]: TemplateGenerator(name),
      [`./test/frontend/templates/${name}.tsx`]: TemplateTestGenerator(name),
    }
  }
}
