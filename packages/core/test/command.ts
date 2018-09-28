import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Command } from '../src'

@suite('Command')
export class Test {
  @test
  async 'can be instantiated, executed and reverted'() {
    const CMD = class extends Command {
      async execute() {
        return 'execute'
      }
      async revert() {
        return 'revert'
      }
    }
    const cmd = new CMD()
    cmd.should.be.instanceOf(Command)
    const executeResult = await cmd.execute()
    executeResult.should.be.equal('execute')
    const revertResult = await cmd.revert()
    revertResult.should.be.equal('revert')
  }
}
