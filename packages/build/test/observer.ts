import { FS } from '@seagull/commands-fs'
import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Observer } from '../src'

@suite('Observer')
export class Test extends BasicTest {
  mocks = [new FSMock('/tmp')]

  @test
  async 'can build initial dist folder from scratch'() {
    const routePath = '/tmp/src/routes/a.ts'
    const routeContent = 'export default {}'
    await new FS.WriteFile(routePath, routeContent).execute()
    const pagePath = '/tmp/src/pages/b.tsx'
    const pageContent = 'export default {}'
    await new FS.WriteFile(pagePath, pageContent).execute()
    await new FS.CreateFolder('/tmp/static').execute()
    const observer = new Observer('/tmp', { vendor: [] })
    await observer.initialize()
    const jsFile = await new FS.Exists('/tmp/dist/routes/a.js').execute()
    const jsxFile = await new FS.Exists('/tmp/dist/pages/b.js').execute()
    jsFile.should.be.equal(true)
    jsxFile.should.be.equal(true)
  }
}
