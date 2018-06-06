import { Page } from '@scaffold'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'

@suite('Unit::Scaffold::Page')
class Test {
  @test
  'can generate minimal API'() {
    const gen = Page('MyPage', { path: '/' })
    const code = gen.toString()
    expect(code).to.contain('export default class MyPage extends Page<{}, {}>')
  }

  @test
  'begins with correct react import'() {
    const gen = Page('MyPage', { path: '/' })
    const code = gen.toString()
    expect(code).to.contain(`import * as React from 'react'`)
  }

  @test
  'contains correct Page import'() {
    const gen = Page('MyPage', { path: '/something' })
    const code = gen.toString()
    expect(code).to.contain(`import { Page } from '@seagull/framework'`)
  }

  @test
  'contains corrent path as prop if not path is set'() {
    const gen = Page('MyPage', { path: '' })
    const code = gen.toString()
    expect(code).to.contain(`path: string = '/'`)
  }

  @test
  'contains corrent path as prop if only a slash is set as path'() {
    const gen = Page('MyPage', { path: '/' })
    const code = gen.toString()
    expect(code).to.contain(`path: string = '/'`)
  }

  @test
  'contains correct path as prop without a slash is set in front'() {
    const gen = Page('MyPage', { path: 'something' })
    const code = gen.toString()
    expect(code).to.contain(`path: string = '/something'`)
  }

  @test
  'contains correct path as prop if path is set with slash in front'() {
    const gen = Page('MyPage', { path: '/something' })
    const code = gen.toString()
    expect(code).to.contain(`path: string = '/something'`)
  }

  @test
  'contains render method'() {
    const gen = Page('MyPage', { path: '/something' })
    const code = gen.toString()
    expect(code).to.contain('render() {')
    expect(code).to.contain('<h1>Hello World!</h1>')
  }
}
