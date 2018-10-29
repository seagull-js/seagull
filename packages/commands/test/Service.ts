import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Command, Service } from '../src'

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
class SRV extends Service {
  async initialize() {
    // do stuff
  }
}

@suite('Service')
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
}
