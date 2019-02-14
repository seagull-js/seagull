import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import { findAliasConfig } from '../../src'

@suite('FindAliasConfig')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }

  @test
  async 'can find the right aliasConfig with wildcard'() {
    const domains = ['sg.example.com', 'abc.example.com']
    const schemaArns = [
      {
        acmCertRef: '1',
        names: ['*.api.example.com'],
      },
      {
        acmCertRef: '2',
        names: ['*.example.com'],
      },
    ]
    const aliasConfig = findAliasConfig(schemaArns, domains)
    const aliasConfigIsNotUndefined = aliasConfig !== undefined
    aliasConfigIsNotUndefined.should.be.equals(true)
    // tslint:disable-next-line:no-unused-expression
    aliasConfig && aliasConfig.acmCertRef.should.be.equals('2')
  }

  @test
  async 'can find the right aliasConfig with specific urls'() {
    const domains = ['sg.example.com', 'abc.example.com']
    const schemaArns = [
      {
        acmCertRef: '1',
        names: ['*.api.example.com'],
      },
      {
        acmCertRef: '2',
        names: ['sg.example.com', 'abc.example.com', 'la.example.com'],
      },
    ]
    const aliasConfig = findAliasConfig(schemaArns, domains)
    const aliasConfigIsNotUndefined = aliasConfig !== undefined
    aliasConfigIsNotUndefined.should.be.equals(true)
    // tslint:disable-next-line:no-unused-expression
    aliasConfig && aliasConfig.acmCertRef.should.be.equals('2')
  }

  @test
  async 'can find no aliasConfig without matching schemata'() {
    const domains = ['sg.example.com', 'abc.example.com']
    const schemaArns = [
      {
        acmCertRef: '1',
        names: ['*.api.example.com'],
      },
      {
        acmCertRef: '2',
        names: ['example.com', 'sgexample.com'],
      },
    ]
    const aliasConfig = findAliasConfig(schemaArns, domains)
    const aliasConfigIsNotUndefined = aliasConfig !== undefined
    aliasConfigIsNotUndefined.should.be.equals(false)
  }
}
