import { OrganismPlan } from '@scaffold/plans'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Scaffold::Plans::OrganismPlan')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const organismPlan = new OrganismPlan('/tmp', 'Button')
    organismPlan.should.be.an('object')
    organismPlan.srcFolder.should.be.equal('/tmp')
    const expectedFilePath = './frontend/organisms/Button.tsx'
    organismPlan.structure.should.have.key(expectedFilePath)
  }

  @test
  async 'can create files when applied'() {
    const organismPlan = new OrganismPlan('/tmp', 'Button')
    organismPlan.apply()
    const expectedFilePath = '/tmp/frontend/organisms/Button.tsx'
    const file = fs.readFileSync(expectedFilePath, 'utf-8')
    file.should.contain('import { Organism }')
    file.should.contain('export default class Button extends Organism')
  }
}
