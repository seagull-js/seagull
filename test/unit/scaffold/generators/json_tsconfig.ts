import { JsonTsconfig } from '@scaffold/generators'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'

@suite('Unit::Scaffold::JsonTsconfig')
class Test {
  @test
  'can be initialized'() {
    const gen = JsonTsconfig()
    expect(gen).to.be.an('object')
  }

  @test
  'react is enabled for frontend code'() {
    const gen = JsonTsconfig()
    const code = gen.toString()
    expect(code).to.contain(`"jsx": "react"`)
  }

  @test
  'outfolder is hardcoded for serverless deployment'() {
    const gen = JsonTsconfig()
    const code = gen.toString()
    expect(code).to.contain(`"outDir": ".seagull/dist"`)
  }

  @test
  'decorators are enabled fully for backend models'() {
    const gen = JsonTsconfig()
    const code = gen.toString()
    expect(code).to.contain(`"experimentalDecorators": true`)
    expect(code).to.contain(`"emitDecoratorMetadata": true,`)
  }

  @test
  'modern transpilation with sourcemaps are enabled for better debugging'() {
    const gen = JsonTsconfig()
    const code = gen.toString()
    expect(code).to.contain(`"target": "es5"`)
    expect(code).to.contain(`"sourceMap": true`)
  }
}
