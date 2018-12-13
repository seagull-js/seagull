import { Process as ProcessMock } from '@seagull/mock-process'
import { FS as FSMock } from '@seagull/mock-fs'
import { Page } from '@seagull/pages'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as path from 'path'
import * as React from 'react'
import { Route, RouteTest } from '../src'

class DemoPage extends Page {
  html() {
    return <div>Hello</div>
  }
}

class DemoRouteWithPage extends Route {
  static method = 'GET'
  static path = '/'
  async handler() {
    return this.render(DemoPage, {})
  }
}

class DemoRouteWithPath extends Route {
  static method = 'GET'
  static path = '/'
  async handler() {
    return this.render('DemoPage', {})
  }
}

const ReactBundle = fs.existsSync(
  `${process.cwd()}/node_modules/react/umd/react.development.js`
)
  ? fs.readFileSync(
      `${process.cwd()}/node_modules/react/umd/react.development.js`,
      'utf-8'
    )
  : fs.readFileSync(
      path.join(
        process.cwd(),
        '../../',
        'node_modules/react/umd/react.development.js'
      ),
      'utf-8'
    )

@suite('Route::Render')
export class Test extends RouteTest {
  mocks = [new ProcessMock({ cwd: '/tmp' }), new FSMock('/tmp')]
  route = DemoRouteWithPage

  @test
  async 'can return rendered Page as html response when given Page Class'() {
    const { code, data, headers } = await this.invoke('GET', '/', {})
    code.should.be.equal(200)
    headers['content-type'].should.be.equal('text/html')
    data.should.be.a('string')
    data.should.contain('<div id="app"><div>Hello</div></div>')
  }

  @test.skip()
  async 'can return rendered Page as html response when given Page Path'() {
    // prepare file
    const pagePath = `${process.cwd()}/dist/assets/pages/DemoPage.js`
    const pageContent = `module.exports.default = () => this.React.createElement('div', null, 'hello')`
    const fileContent = `${ReactBundle};\n${pageContent}`
    fs.mkdirSync('/tmp/dist')
    fs.mkdirSync('/tmp/dist/assets')
    fs.mkdirSync('/tmp/dist/assets/pages')
    fs.writeFileSync(pagePath, fileContent, 'utf-8')

    // execute route handler
    this.route = DemoRouteWithPath
    const { code, data, headers } = await this.invoke('GET', '/', {})

    // inspect response
    code.should.be.equal(200)
    headers['content-type'].should.be.equal('text/html')
    data.should.be.a('string')
    data.should.contain('<div id="app"><div>Hello</div></div>')
  }
}
