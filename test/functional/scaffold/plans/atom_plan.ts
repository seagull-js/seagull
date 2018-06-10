import { AtomPlan } from '@scaffold/plans'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Scaffold::Plans::AtomPlan')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const atomPlan = new AtomPlan('/tmp', 'Button')
    atomPlan.should.be.an('object')
    atomPlan.srcFolder.should.be.equal('/tmp')
    atomPlan.structure.should.have.keys([
      './frontend/atoms/Button.tsx',
      './test/frontend/atoms/Button.tsx',
    ])
  }

  @test
  async 'can create files when applied'() {
    const atomPlan = new AtomPlan('/tmp', 'Button')
    atomPlan.apply()
    const atomPath = '/tmp/frontend/atoms/Button.tsx'
    const atomFile = fs.readFileSync(atomPath, 'utf-8')
    atomFile.should.contain('export default class Button extends Atom')
    const atomTestPath = '/tmp/test/frontend/atoms/Button.tsx'
    const atomTestFile = fs.readFileSync(atomTestPath, 'utf-8')
    atomTestFile.should.contain('class Test extends AtomTest<Button>')
  }
}
