import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { FS } from '../../../src/commands'
import { BasicTest } from '../../basic_test'

@suite('Unit::Commands::FS')
export class Test extends BasicTest {
  mocks = [new this.mock.FS('/tmp')]

  @test
  async 'WriteFile and ReadFile work'() {
    const content = '<html />'
    await new FS.WriteFile('/tmp/index.html', content).execute()
    const file = await new FS.ReadFile('/tmp/index.html').execute()
    file.should.be.equal(content)
  }

  @test
  async 'ReadFile returns empty string (falsy) if target does not exist'() {
    const file = await new FS.ReadFile('/tmp/index.html').execute()
    file.should.be.equal('')
  }

  @test
  async 'WriteFile can be reverted'() {
    const content = '<html />'
    const writer = new FS.WriteFile('/tmp/index.html', content)
    await writer.execute()
    await writer.revert()
    const reader = new FS.ReadFile('/tmp/index.html')
    const file = await reader.execute()
    file.should.be.equal('')
  }

  @test
  async 'CopyFile works'() {
    const content = '<html />'
    await new FS.WriteFile('/tmp/index.html', content).execute()
    const cmd = new FS.CopyFile('/tmp/index.html', '/tmp/about.html')
    await cmd.execute()
    const reader = new FS.ReadFile('/tmp/about.html')
    const copyBeforeRevert = await reader.execute()
    copyBeforeRevert.should.be.equal(content)
    await cmd.revert()
    const copyAfterRevert = await reader.execute()
    copyAfterRevert.should.be.equal('')
  }
}
