import { expect } from 'chai'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { FixtureStorage } from '../src'

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
  async 'can create set and get data'() {
    const fs = new FixtureStorage<string>('../seed/something', '.json')
    fs.set('asdf')
    const data = fs.get()
    expect(data).to.eq('asdf')
  }

  @test
  async 'can get the created date of a seed'() {
    const fs = new FixtureStorage<string>('../seed/something', '.json')
    fs.set('asdf')
    const date = new Date()
    expect(fs.createdDate).to.be.a('Date')
    expect(fs.createdDate!.toString()).to.eq(date.toString())
  }

  @test
  async 'can get the config of a seed'() {
    const fs = new FixtureStorage<string>('../seed/something', '.json')
    fs.set('asdf')
    expect(fs.config).to.be.an('object')
    expect(fs.config.hook).to.be.a('function')
    expect(fs.config.expiresInDays).to.eq(0)
  }
}
