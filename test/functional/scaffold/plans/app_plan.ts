import { AppPlan } from '@scaffold/plans'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Scaffold::Plans::AppPlan')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const appPlan = new AppPlan('/tmp', 'DemoApp', 'static')
    appPlan.should.be.an('object')
    appPlan.srcFolder.should.be.equal('/tmp')
    appPlan.structure.should.have.keys([
      './frontend/atoms/index.ts',
      './frontend/molecules/index.ts',
      './frontend/organisms/index.ts',
      './frontend/index.ts',
      '.gitignore',
      'package.json',
      'tsconfig.json',
      'tslint.json',
    ])
  }

  @test
  async 'can create initial app files for static apps'() {
    const appPlan = new AppPlan('/tmp', 'DemoApp', 'static')
    appPlan.apply()
    const pkg = fs.readFileSync('/tmp/DemoApp/package.json', 'utf-8')
    JSON.parse(pkg).name.should.be.equal('DemoApp')
    const config = fs.readFileSync('/tmp/DemoApp/tsconfig.json', 'utf-8')
    JSON.parse(config).should.be.an('object')
    const lint = fs.readFileSync('/tmp/DemoApp/tslint.json', 'utf-8')
    JSON.parse(lint).should.be.an('object')
    const gitignore = fs.readFileSync('/tmp/DemoApp/.gitignore', 'utf-8')
    gitignore.should.contain('node_modules')
    const folders = fs.readdirSync('/tmp/DemoApp')
    folders.should.contain('frontend')
    const frontend = fs.readFileSync('/tmp/DemoApp/frontend/index.ts', 'utf-8')
    frontend.should.contain('export { default as Atom }')
  }
}
