import { MoleculePlan } from '@scaffold/plans'
import 'chai/register-should'
import * as fs from 'fs'
import { suite, test } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Scaffold::Plans::MoleculePlan')
export class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const moleculePlan = new MoleculePlan('/tmp', 'Button')
    moleculePlan.should.be.an('object')
    moleculePlan.srcFolder.should.be.equal('/tmp')
    moleculePlan.structure.should.have.keys([
      './frontend/molecules/Button.tsx',
      './test/frontend/molecules/Button.tsx',
    ])
  }

  @test
  async 'can create files when applied'() {
    const moleculePlan = new MoleculePlan('/tmp', 'Button')
    moleculePlan.apply()
    const moleculeFilePath = '/tmp/frontend/molecules/Button.tsx'
    const moleculeFile = fs.readFileSync(moleculeFilePath, 'utf-8')
    moleculeFile.should.contain('export default class Button extends Molecule')
    const moleculeTestFilePath = '/tmp/test/frontend/molecules/Button.tsx'
    const moleculeTestFile = fs.readFileSync(moleculeTestFilePath, 'utf-8')
    moleculeTestFile.should.contain('class Test extends MoleculeTest<Button>')
  }
}
