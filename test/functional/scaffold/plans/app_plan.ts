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
      './frontend/pages/Index.tsx',
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
    const read = (path: string) => fs.readFileSync(path, 'utf-8')
    const pkg = read('/tmp/DemoApp/package.json')
    JSON.parse(pkg).name.should.be.equal('DemoApp')
    const config = read('/tmp/DemoApp/tsconfig.json')
    JSON.parse(config).should.be.an('object')
    const lint = read('/tmp/DemoApp/tslint.json')
    JSON.parse(lint).should.be.an('object')
    const gitignore = read('/tmp/DemoApp/.gitignore')
    gitignore.should.contain('node_modules')
    const folders = fs.readdirSync('/tmp/DemoApp')
    folders.should.contain('frontend')
    const indexPage = read('/tmp/DemoApp/frontend/pages/Index.tsx')
    indexPage.should.contain('export default class IndexPage extends Page')
    indexPage.should.contain(`path: string = '/'`)
  }
}
