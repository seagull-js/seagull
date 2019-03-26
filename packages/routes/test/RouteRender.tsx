import { FS } from '@seagull/commands-fs'
import { Process as ProcessMock } from '@seagull/mock-process'
import { Page } from '@seagull/pages'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as path from 'path'
import * as React from 'react'
import { Route, RouteContext, RouteTest } from '../src'

class DemoPage extends Page {
  html() {
    return <div>Hello</div>
  }
}

class DemoRouteWithPage extends Route {
  static path = '/'
  static async handler(this: RouteContext) {
    return this.render(DemoPage, {})
  }
}

class DemoRouteWithPath extends Route {
  static path = '/'
  static async handler(this: RouteContext) {
    return this.render('DemoPage', {})
  }
}

const getReactBundle = async () => {
  const existCmd = new FS.Exists(
    `${process.cwd()}/node_modules/react/umd/react.development.js`
  )
  existCmd.mode = { ...existCmd.mode, environment: 'edge' }
  const exist: boolean = await existCmd.execute()

  const reactBundlePath = exist
    ? `${process.cwd()}/node_modules/react/umd/react.development.js`
    : path.join(
        process.cwd(),
        '../../',
        'node_modules/react/umd/react.development.js'
      )
  const fileContent = await new FS.ReadFile(reactBundlePath).execute()
  return fileContent
}

@suite('Route::Render')
export class Test extends RouteTest {
  mocks = [new ProcessMock({ cwd: '/tmp' })]
  route = DemoRouteWithPage

  @test
  async 'can return rendered Page as html response when given Page Class'() {
    const { code, data, headers } = await this.invoke('/', {})
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
    const fileContent = `${await getReactBundle()};\n${pageContent}`
    await new FS.CreateFolder('/tmp/dist/assets/pages').execute()
    await new FS.WriteFile(pagePath, fileContent).execute()

    // execute route handler
    this.route = DemoRouteWithPath
    const { code, data, headers } = await this.invoke('/', {})

    // inspect response
    code.should.be.equal(200)
    headers['content-type'].should.be.equal('text/html')
    data.should.be.a('string')
    data.should.contain('<div id="app"><div>Hello</div></div>')
  }
}
