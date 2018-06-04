import { IndexFileGenerator } from '@tools/workers'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Tools::Workers::IndexFileGenerator')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const indexFileGenerator = new IndexFileGenerator('/tmp')
    indexFileGenerator.should.be.an('object')
    indexFileGenerator.srcFolder.should.be.equal('/tmp')
  }

  @test
  async 'can bundle source files'() {
    const indexFileGenerator = new IndexFileGenerator('/tmp')
    indexFileGenerator.should.be.an('object')
    indexFileGenerator.srcFolder.should.be.equal('/tmp')
    await indexFileGenerator.watcherWillStart()
    const file = fs.readFileSync('/tmp/.seagull/dist/index.html', 'utf-8')
    file.should.contain('<div id="app"></div>')
  }
}
