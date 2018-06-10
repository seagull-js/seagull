import { PackageJsonGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Json::JsonPackage')
export class Test {
  @test
  'can be initialized'() {
    const gen = PackageJsonGenerator('demo', '0.1.2')
    gen.should.be.an('object')
  }

  @test
  'name gets passed into file'() {
    const gen = PackageJsonGenerator('demo', '0.1.2')
    const code = gen.toString()
    code.should.contain(`"name": "demo"`)
  }

  @test
  'sets dev deps for the end user'() {
    const gen = PackageJsonGenerator('demo', '0.1.2')
    const code = gen.toString()
    code.should.contain(`"aws-sdk": "^2.104.0"`)
    code.should.contain(`"typescript": "^2.9.0"`)
  }
}
