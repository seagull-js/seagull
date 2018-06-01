import { Compiler } from '@tools/workers'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import FunctionalTest from '../../../helper/functional_test'

@suite('Functional::Tools::Workers::Compiler')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('/tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can be instantiated'() {
    const compiler = new Compiler('/tmp')
    compiler.should.be.an('object')
    compiler.srcFolder.should.be.equal('/tmp')
    compiler.config.compilerOptions.outDir.should.be.equal('.seagull/dist')
  }

  @test
  'does load tsconfig if existing'() {
    fs.writeFileSync('/tmp/tsconfig.json', '{"compilerOptions": {}}', 'utf-8')
    const compiler = new Compiler('/tmp')
    compiler.config.should.be.deep.equal({ compilerOptions: {} })
  }

  @test
  async 'can compile source folders'() {
    fs.mkdirSync('/tmp/frontend')
    fs.writeFileSync('/tmp/frontend/a.ts', 'export default {}', 'utf-8')
    const compiler = new Compiler('/tmp')
    await compiler.watcherWillStart()
    const file = fs.readFileSync('/tmp/.seagull/dist/frontend/a.js', 'utf-8')
    file.should.contain('exports["default"] = {}')
  }

  @test
  async 'can compile single file on created hook'() {
    fs.mkdirSync('/tmp/src')
    fs.writeFileSync('/tmp/src/a.ts', 'export default {}', 'utf-8')
    const compiler = new Compiler('/tmp')
    await compiler.onFileCreated('/tmp/src/a.ts')
    const file = fs.readFileSync('/tmp/.seagull/dist/src/a.js', 'utf-8')
    file.should.contain('exports["default"] = {}')
  }

  @test
  async 'can compile single file on changed hook'() {
    fs.mkdirSync('/tmp/src')
    fs.writeFileSync('/tmp/src/a.ts', 'export default {}', 'utf-8')
    const compiler = new Compiler('/tmp')
    await compiler.onFileChanged('/tmp/src/a.ts')
    const file = fs.readFileSync('/tmp/.seagull/dist/src/a.js', 'utf-8')
    file.should.contain('exports["default"] = {}')
  }

  @test
  async 'can delete compiled file on removed hook'() {
    const srcPath = '/tmp/src/a.ts'
    fs.mkdirSync('/tmp/src')
    fs.writeFileSync(srcPath, 'export default {}', 'utf-8')
    const compiler = new Compiler('/tmp')
    await compiler.onFileChanged(srcPath)
    const dstPath = '/tmp/.seagull/dist/src/a.js'
    const file = fs.readFileSync(dstPath, 'utf-8')
    file.should.contain('exports["default"] = {}')
    await compiler.onFileRemoved(srcPath)
    fs.existsSync(dstPath).should.be.equal(false)
  }
}
