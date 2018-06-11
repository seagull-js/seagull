import { TemplatePlan } from '@scaffold/plans'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Scaffold::Plans::TemplatePlan')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const templatePlan = new TemplatePlan('/tmp', 'Button')
    templatePlan.should.be.an('object')
    templatePlan.srcFolder.should.be.equal('/tmp')
    const expectedFilePath = './frontend/templates/Button.tsx'
    templatePlan.structure.should.have.keys([
      './frontend/templates/Button.tsx',
      './test/frontend/templates/Button.tsx',
    ])
  }

  @test
  async 'can create files when applied'() {
    const templatePlan = new TemplatePlan('/tmp', 'Button')
    templatePlan.apply()
    const templateFilePath = '/tmp/frontend/templates/Button.tsx'
    const templateFile = fs.readFileSync(templateFilePath, 'utf-8')
    templateFile.should.contain('export default class Button extends Template')
    const templateTestFilePath = '/tmp/test/frontend/templates/Button.tsx'
    const templateTestFile = fs.readFileSync(templateTestFilePath, 'utf-8')
    templateTestFile.should.contain('class Test extends TemplateTest<Button>')
  }
}
