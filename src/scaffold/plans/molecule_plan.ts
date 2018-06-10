import { MoleculeGenerator } from '../generators'
import { Plan } from './plan'

export class MoleculePlan extends Plan {
  constructor(srcFolder: string, public name: string) {
    super(srcFolder)
    const moleculePath = `./frontend/molecules/${name}.tsx`
    const moleculeGenerator = MoleculeGenerator(name)
    this.structure = {}
    this.structure[moleculePath] = moleculeGenerator
  }
}
