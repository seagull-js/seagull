import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Command, CommandService } from '../src'

// dummy command
class CMD extends Command {
  async execute() {
    return 'execute'
  }
  async revert() {
    return 'revert'
  }
}

// dummy service
class SRV extends CommandService {
  async initialize() {
    // do stuff
  }
}

@suite('CommandService')
export class Test {
  @test
  async 'can be instantiated, execute a key and execute all'() {
    const cmd = new CMD()
    const service = new SRV()
    await service.initialize()
    service.register('cmd', cmd)
    service.list.should.be.deep.equal({ cmd })
    const result = await service.processOne('cmd')
    result.should.be.equal('execute')
    const results = await service.processAll()
    results.should.be.deep.equal(['execute'])
    service.remove('cmd')
    service.list.should.be.deep.equal({})
  }

  @test
  async 'can be instantiated with static constructor'() {
    const cmd = new CMD()
    const service = await SRV.create()
    service.register('cmd', cmd)
    service.list.should.be.deep.equal({ cmd })
  }

  @test
  async 'can process only whitelisted or blacklisted keys'() {
    const cmd = new CMD()
    const service = await SRV.create()
    service.register('cmd1', cmd)
    service.register('cmd2', cmd)
    const resultsOnly = await service.processOnly(['cmd1'])
    resultsOnly.should.be.deep.equal(['execute'])
    const resultsWithout = await service.processWithout(['cmd1'])
    resultsWithout.should.be.deep.equal(['execute'])
  }
}
