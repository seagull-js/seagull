import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Command } from '../src'

const CMD = class extends Command {
  async execute() {
    return 'execute'
  }
  async revert() {
    return 'revert'
  }
}

@suite('Command')
export class Test {
  @test
  async 'can be instantiated, executed and reverted'() {
    const cmd = new CMD()
    cmd.should.be.instanceOf(Command)
    const executeResult = await cmd.execute()
    executeResult.should.be.equal('execute')
    const revertResult = await cmd.revert()
    revertResult.should.be.equal('revert')
  }

  @test
  async 'global mode can be overridden'() {
    const cmd = new CMD()
    const lastEnv = cmd.mode.environment
    cmd.mode = { ...cmd.mode, environment: 'cloud' }
    cmd.mode.environment.should.be.eq('cloud')
    cmd.mode = new CMD().mode
    cmd.mode.environment.should.be.be.eq(lastEnv)
  }
}
