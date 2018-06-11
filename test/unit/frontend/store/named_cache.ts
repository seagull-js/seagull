import { NamedCache } from '@frontend/store//named_cache'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'

@suite('Unit::Frontend::Store::NamedCache')
class Test {
  @test
  async 'can be instantiated'() {
    const cache = new NamedCache()
    cache.should.be.an('object')
  }

  @test
  async 'can store values'() {
    const cache = new NamedCache()
    cache.set('demo', { counter: 1 })
    const value = cache.get('demo')
    value.should.be.an('object')
  }

  @test
  async 'does return cached values'() {
    const cache = new NamedCache()
    cache.set('demo', { counter: 1 })
    const value1 = cache.get('demo')
    const value2 = cache.get('demo')
    value1.should.be.deep.equal(value2)
    value1.should.be.equal(value2)
  }

  @test
  async 'can reset single dictionary'() {
    const cache = new NamedCache()
    cache.set('demo', { counter: 1 })
    const value1 = cache.get('demo')
    cache.reset('demo')
    const value2 = cache.get('demo')
    value1.should.not.be.equal(value2)
    ;(typeof value2).should.be.equal('undefined')
  }

  @test
  async 'can reset all dictionaries'() {
    const cache = new NamedCache()
    cache.set('demo1', { counter: 1 })
    cache.set('demo2', { counter: 2 })
    cache.reset()
    const value1 = cache.get('demo')
    const value2 = cache.get('demo')
    ;(typeof value1).should.be.equal('undefined')
    ;(typeof value2).should.be.equal('undefined')
  }
}
