import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Item } from '../src'

class Config extends Item {
  id: string = 'i18n'
  setting: boolean = true
}

class Todo extends Item {
  id: string
  text: string

  constructor(id: string, text: string) {
    super()
    this.id = id
    this.text = text
  }
}

@suite('Item')
export class Test extends BasicTest {
  @test
  async 'can be created and saved'() {
    const cfg1 = new Config()
    await cfg1.save()
    const cfg2 = await Config.get('i18n')
    cfg2.setting.should.be.equal(true)
  }

  @test
  async 'can be created directly'() {
    await Config.put({ id: 'putter', setting: true })
    const cfg = await Config.get('putter')
    cfg.setting.should.be.equal(true)
  }

  @test
  async '<Item>.get does throw if id does not exist'() {
    try {
      const cfg = await Config.get('missing')
      cfg.id.should.be.equal('this should never run')
    } catch (error) {
      error.should.be.not.equal(null)
    }
  }

  @test
  async 'can be deleted'() {
    await Config.put({ id: 'remover' })
    await Config.delete('remover')
    try {
      const cfg = await Config.get('remover')
      cfg.id.should.be.equal('this should never run')
    } catch (error) {
      error.should.be.not.equal(null)
    }
  }

  @test
  async 'can all be deleted'() {
    await Todo.putAll([
      { id: '1', text: 'a' },
      { id: '2', text: 'b' },
      { id: '3', text: 'c' },
    ])
    await Todo.deleteAll()
    const result = await Todo.all()
    result.should.be.an('array')
    result.should.have.lengthOf(0)
  }

  @test
  async 'can get a list of all instances'() {
    await Config.put({ id: 'something', setting: true })
    const list = await Config.all()
    list.should.be.deep.equal([{ id: 'something', setting: true }])
  }

  @test
  async 'can be used with items that have a constructor'() {
    await new Todo('1', 'a').save()
    await Todo.put({ id: '2', text: 'b' })
    const list = await Todo.all()
    list.should.be.deep.equal([{ id: '1', text: 'a' }, { id: '2', text: 'b' }])
  }

  @test
  async 'can put a list of items'() {
    await Todo.putAll([{ id: '1', text: 'a' }, { id: '2', text: 'b' }])
    const list = await Todo.all()
    list.should.be.deep.equal([{ id: '1', text: 'a' }, { id: '2', text: 'b' }])
  }
}
