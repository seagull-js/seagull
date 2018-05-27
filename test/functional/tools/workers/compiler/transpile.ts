import { transpileFile, transpileFolder } from '@tools/workers'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'
import * as rfs from 'require-from-string'
import FunctionalTest from '../../../../helper/functional_test'

@suite('Functional::Tools::Workers::Compiler::Transpile')
class Test extends FunctionalTest {
  before() {
    this.mockFolder('./tmp')
  }
  after() {
    this.restoreFolder()
  }

  @test
  'can transpile single file'() {
    const tsContent = 'export default {}'
    const srcPath = './tmp/example.ts'
    const dstPath = './tmp/example.js'
    fs.writeFileSync(srcPath, tsContent, 'utf-8')
    transpileFile(srcPath, dstPath)
    const file = fs.readFileSync(dstPath, 'utf-8')
    file.should.contain('{}')
    const code = rfs(file)
    code.default.should.be.an('object')
    code.default.should.be.deep.equal({})
  }

  @test
  'can transpile folder'() {
    const tsContent = 'export default {}'
    const srcPath = './tmp/demoTS'
    const dstPath = './tmp/demoJS'
    fs.mkdirSync(srcPath)
    fs.writeFileSync(`${srcPath}/example.ts`, tsContent, 'utf-8')
    transpileFolder(srcPath, dstPath)
    const filePath = `${dstPath}/example.js`
    const code = rfs(fs.readFileSync(filePath, 'utf-8'))
    code.default.should.be.an('object')
    code.default.should.be.deep.equal({})
  }
}
