import { PagePlan } from '@scaffold/plans'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Scaffold::Plans::PagePlan')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const pagePlan = new PagePlan('/tmp', 'Button')
    pagePlan.should.be.an('object')
    pagePlan.srcFolder.should.be.equal('/tmp')
    pagePlan.structure.should.have.keys([
      './frontend/pages/Button.tsx',
      './test/frontend/pages/Button.tsx',
    ])
  }

  @test
  async 'can create files when applied'() {
    const pagePlan = new PagePlan('/tmp', 'Button')
    pagePlan.apply()
    const atomPath = '/tmp/frontend/pages/Button.tsx'
    const atomFile = fs.readFileSync(atomPath, 'utf-8')
    atomFile.should.contain('export default class Button extends Page')
    const atomTestPath = '/tmp/test/frontend/pages/Button.tsx'
    const atomTestFile = fs.readFileSync(atomTestPath, 'utf-8')
    atomTestFile.should.contain('class Test extends PageTest<Button>')
  }
}
