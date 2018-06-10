import { MoleculePlan } from '@scaffold/plans'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Scaffold::Plans::MoleculePlan')
class Test extends FunctionalTest {
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
    const expectedFilePath = './frontend/molecules/Button.tsx'
    moleculePlan.structure.should.have.key(expectedFilePath)
  }

  @test
  async 'can create files when applied'() {
    const moleculePlan = new MoleculePlan('/tmp', 'Button')
    moleculePlan.apply()
    const expectedFilePath = '/tmp/frontend/molecules/Button.tsx'
    const file = fs.readFileSync(expectedFilePath, 'utf-8')
    file.should.contain('import { Molecule }')
    file.should.contain('export default class Button extends Molecule')
  }
}
