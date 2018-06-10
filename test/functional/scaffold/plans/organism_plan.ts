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
    organismPlan.structure.should.have.keys([
      './frontend/organisms/Button.tsx',
      './test/frontend/organisms/Button.tsx',
    ])
  }

  @test
  async 'can create files when applied'() {
    const organismPlan = new OrganismPlan('/tmp', 'Button')
    organismPlan.apply()
    const organismFilePath = '/tmp/frontend/organisms/Button.tsx'
    const organismFile = fs.readFileSync(organismFilePath, 'utf-8')
    organismFile.should.contain('export default class Button extends Organism')
    const organismTestFilePath = '/tmp/test/frontend/organisms/Button.tsx'
    const organismTestFile = fs.readFileSync(organismTestFilePath, 'utf-8')
    organismTestFile.should.contain('class Test extends OrganismTest<Button>')
  }
}
