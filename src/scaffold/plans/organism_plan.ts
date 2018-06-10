import { OrganismGenerator } from '../generators'
import { Plan } from './plan'

export class OrganismPlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    const organismPath = `./frontend/organisms/${name}.tsx`
    const organismGenerator = OrganismGenerator(name)
    this.structure = {}
    this.structure[organismPath] = organismGenerator
  }
}
