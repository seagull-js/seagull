// tslint:disable: no-unused-expression
import { expect } from 'chai'
import 'chai/register-should'
import { suite, test, timeout } from 'mocha-typescript'
import { FixtureStorage } from '../src'

const content = 'asdf'

@suite('Seed::FixtureStorage')
export class Test {
  @test
  async 'can create fixture storage'() {
    const uri = '../seed/something'
    const fileExtension = '.json'
    const fs = new FixtureStorage<string>(uri, fileExtension)
    expect(fs).to.be.an('object')
    expect(fs.uri).to.eq(uri)
    expect(fs.fileExtension).to.eq('.json')
  }

  @test
  async 'can set and get fixture'() {
    const fs = new FixtureStorage<string>('../seed/something', '.json')
    fs.set(content)
    const data = fs.get()
    expect(data).to.eq(content)
  }

  @test
  async 'can get the modified date of a seed'() {
    const fs = new FixtureStorage<string>('../seed/something', '.json')
    fs.set(content)
    const date = new Date()
    expect(fs.modifiedDate).to.be.a('Date')
    expect(fs.modifiedDate!.toString()).to.eq(date.toString())
  }

  // TODO: expired

  @test
  async 'can get if a seed exists and is loadable'() {
    const fs = new FixtureStorage<string>('../seed/something', '.json')
    expect(fs.exists).to.be.true
  }

  // TODO: uriLocal

  @test
  @timeout(10000)
  async 'can get the config of a seed'() {
    const fs = new FixtureStorage<string>('../seed/somethingHooky', '.json')
    fs.set(content)
    expect(fs.config).to.be.an('object')
    expect(fs.config.hook!(content)).to.eq('qwer')
    expect(fs.config.expiresInDays).to.eq(0)
  }

  // TODO: createByUrl
  // TODO: createByWsdlUrl
  // TODO: testScope
}
