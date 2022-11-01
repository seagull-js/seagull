import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Process } from '../src'

@suite('Mocks::Process')
export class Test extends BasicTest {
  @test
  async 'can be enabled and disabled'() {
    process.env.npm_package_name!.should.be.equal('@seagull/mock-process')
    const currentCWD = process.cwd()
    const env = { npm_package_name: 'xxx' }
    const cwd = '/tmp'
    const mock = new Process({ cwd, env })
    mock.activate()
    process.env.npm_package_name!.should.be.equal('xxx')
    process.cwd().should.be.equal('/tmp')
    mock.deactivate()
    process.env.npm_package_name!.should.be.equal('@seagull/mock-process')
    process.cwd().should.be.equal(currentCWD)
  }
  @test
  async 'state survives disabling/enabling'() {
    process.env.npm_package_name!.should.be.equal('@seagull/mock-process')
    const env = { npm_package_name: 'xxx' }
    const cwd = '/tmp'
    const mock = new Process({ cwd, env })
    mock.activate()
    process.env.npm_package_name!.should.be.equal('xxx')
    mock.deactivate()
    process.env.npm_package_name!.should.be.equal('@seagull/mock-process')
    mock.activate()
    process.env.npm_package_name!.should.be.equal('xxx')
    mock.deactivate()
  }
  @test
  async 'state can be resetted'() {
    const env = { npm_package_name: 'xxx' }
    const cwd = '/tmp'
    const mock = new Process({ cwd, env })
    mock.activate()
    process.env.npm_package_name!.should.be.equal('xxx')
    mock.reset()
    process.env.npm_package_name!.should.be.equal('xxx')
    mock.deactivate()
  }
}
