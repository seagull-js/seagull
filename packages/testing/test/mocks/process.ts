import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { BasicTest, Process } from '../../src'

@suite('Mocks::Process')
export class Test extends BasicTest {
  @test
  async 'can be enabled and disabled'() {
    process.env.npm_package_author_name!.should.be.equal('Maximilian Stroh')
    const currentCWD = process.cwd()
    const env = { npm_package_author_name: 'xxx' }
    const cwd = '/tmp'
    const mock = new Process({ cwd, env })
    mock.activate()
    process.env.npm_package_author_name!.should.be.equal('xxx')
    process.cwd().should.be.equal('/tmp')
    mock.deactivate()
    process.env.npm_package_author_name!.should.be.equal('Maximilian Stroh')
    process.cwd().should.be.equal(currentCWD)
  }
}
