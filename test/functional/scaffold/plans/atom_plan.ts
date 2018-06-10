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
    const expectedFilePath = '/tmp/frontend/components/atoms/Button.tsx'
    atomPlan.structure.should.have.key(expectedFilePath)
  }

  @test
  async 'can bundle source files'() {
    const atomPlan = new AtomPlan('/tmp', 'Button')
    atomPlan.apply()
    const expectedFilePath = '/tmp/frontend/components/atoms/Button.tsx'
    const file = fs.readFileSync(expectedFilePath, 'utf-8')
    // tslint:disable-next-line:no-console
    console.log(file)
  }
}
