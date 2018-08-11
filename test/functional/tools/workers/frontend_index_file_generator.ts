import { writeFile } from '@tools/util'
import { FrontendIndexFileGenerator } from '@tools/workers'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Tools::Workers::FrontendIndexFileGenerator')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const indexFileGenerator = new FrontendIndexFileGenerator('/tmp')
    indexFileGenerator.should.be.an('object')
    indexFileGenerator.srcFolder.should.be.equal('/tmp')
  }

  @test
  async 'can bundle source files'() {
    const indexFileGenerator = new FrontendIndexFileGenerator('/tmp')
    writeFile('/tmp/frontend/pages/test.tsx', `export default class Page {}`)
    await indexFileGenerator.watcherWillStart()
    const targetFilePath = '/tmp/.seagull/dist/frontend/index.js'
    const targetFile = fs.readFileSync(targetFilePath, 'utf-8')
    targetFile.should.contain('export')
    targetFile.should.contain('app')
  }
}
