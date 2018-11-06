import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Item } from '../../src'

class Config extends Item {
  id: string = 'i18n'

  setting: boolean = true
}

@suite('Item')
export class Test extends BasicTest {
  mocks = [new this.mock.S3()]

  @test
  async 'can be created and saved'() {
    const cfg1 = new Config()
    await cfg1.save()
    const cfg2 = await Config.get('i18n')
    cfg2.setting.should.be.equal(true)
  }

  @test
  async 'can be created directly'() {
    await Config.put({ id: 'putter' })
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
}
