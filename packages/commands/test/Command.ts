import { BasicTest } from '@seagull/testing'
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
export class Test extends BasicTest {
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

  @test
  async 'picks correct handlers'() {
    const CMD2 = class extends Command<number> {
      async execute() {
        return this.executeHandler()
      }
      async revert() {
        return this.revertHandler()
      }

      protected async executeEdge() {
        return 1
      }
      protected async executePure() {
        return 2
      }
      protected async executeCloud() {
        return 3
      }
      protected async executeConnected() {
        return 4
      }

      protected async revertEdge() {
        return -1
      }
      protected async revertPure() {
        return -2
      }
      protected async revertCloud() {
        return -3
      }
      protected async revertConnected() {
        return -4
      }
    }
    const cmd = new CMD2()
    ;(await cmd.execute()).should.be.equal(2)
    ;(await cmd.revert()).should.be.equal(-2)
    cmd.mode = { ...cmd.mode, environment: 'edge' }
    ;(await cmd.execute()).should.be.equal(1)
    ;(await cmd.revert()).should.be.equal(-1)
  }
}
