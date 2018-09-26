import { Bundler } from '@tools/workers'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Tools::Workers::Bundler')
export class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const bundler = new Bundler('/tmp')
    bundler.should.be.an('object')
    bundler.srcFolder.should.be.equal('/tmp')
    bundler.entryFile.should.be.equal('/tmp/.seagull/dist/frontend/index.js')
    bundler.outFile.should.be.equal('/tmp/.seagull/assets/bundle.js')
  }

  @test
  async 'can bundle source files'() {
    fs.mkdirSync('/tmp/.seagull')
    fs.mkdirSync('/tmp/.seagull/dist')
    fs.mkdirSync('/tmp/.seagull/dist/frontend')
    const content = 'module.exports = {a: 1}'
    fs.writeFileSync('/tmp/.seagull/dist/frontend/index.js', content, 'utf-8')
    fs.mkdirSync('/tmp/.seagull/assets')
    const bundler = new Bundler('/tmp')
    await bundler.watcherWillStart()
    const file = fs.readFileSync('/tmp/.seagull/assets/bundle.js', 'utf-8')
    file.should.contain('{a: 1}')
  }
}
