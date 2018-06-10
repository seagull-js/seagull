import { MoleculeGenerator, MoleculeTestGenerator } from '../generators'
import { Plan } from './plan'

export class MoleculePlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    this.structure = {
      [`./frontend/molecules/${name}.tsx`]: MoleculeGenerator(name),
      [`./test/frontend/molecules/${name}.tsx`]: MoleculeTestGenerator(name),
    }
  }
}
