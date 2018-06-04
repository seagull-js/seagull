import { writeFile } from '@tools/util'
import { HTTPServer, IndexFileGenerator } from '@tools/workers'
import 'chai/register-should'
import * as fs from 'fs'
import 'isomorphic-fetch'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Tools::Workers::HTTPServer')
class Test extends FunctionalTest {
  server: HTTPServer | undefined
  async before() {
    this.mockFolder('/tmp')
    const indexFileGenerator = new IndexFileGenerator('/tmp')
    indexFileGenerator.should.be.an('object')
    indexFileGenerator.srcFolder.should.be.equal('/tmp')
    await indexFileGenerator.watcherWillStart()
    writeFile('/tmp/.seagull/dist/assets/bundle.js', 'module.exports = {}')
    this.server = new HTTPServer('/tmp')
    await this.server.start()
  }
  async after() {
    await this.server!.stop()
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    this.server!.should.be.an('object')
    this.server!.srcFolder.should.be.equal('/tmp')
  }

  @test
  async 'can serve index.html file by default'() {
    const response = await fetch('http://localhost:8080')
    const text = await response.text()
    text.should.contain('<div id="app"></div>')
  }

  @test
  async 'can serve index.html precisely'() {
    const response = await fetch('http://localhost:8080/index.html')
    const text = await response.text()
    text.should.contain('<div id="app"></div>')
  }

  @test
  async 'can serve javascript bundle from assets folder'() {
    const response = await fetch('http://localhost:8080/assets/bundle.js')
    const text = await response.text()
    text.should.contain('module.exports = {}')
  }
}
