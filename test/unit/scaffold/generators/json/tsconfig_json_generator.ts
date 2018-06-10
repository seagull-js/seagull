import { TsconfigJsonGenerator } from '@scaffold/generators'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

@suite('Unit::Scaffold::Json::TsconfigJsonGenerator')
export class Test {
  @test
  'can be initialized'() {
    const gen = TsconfigJsonGenerator()
    gen.should.be.an('object')
  }

  @test
  'react is enabled for frontend code'() {
    const gen = TsconfigJsonGenerator()
    const code = gen.toString()
    code.should.contain(`"jsx": "react"`)
  }

  @test
  'outfolder is hardcoded for serverless deployment'() {
    const gen = TsconfigJsonGenerator()
    const code = gen.toString()
    code.should.contain(`"outDir": ".seagull/dist"`)
  }

  @test
  'decorators are enabled fully for backend models'() {
    const gen = TsconfigJsonGenerator()
    const code = gen.toString()
    code.should.contain(`"experimentalDecorators": true`)
    code.should.contain(`"emitDecoratorMetadata": true,`)
  }

  @test
  'modern transpilation with sourcemaps are enabled for better debugging'() {
    const gen = TsconfigJsonGenerator()
    const code = gen.toString()
    code.should.contain(`"target": "es5"`)
    code.should.contain(`"sourceMap": true`)
  }
}
