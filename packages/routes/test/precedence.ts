// tslint:disable:no-unused-expression
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Route, sortByPrecedence } from '../src'

const fakeRoute = (path: string) => (({ path } as any) as typeof Route)
const toPath = (r: typeof Route) => r.path

@suite('Route::Precedence')
export class Test {
  @test
  async '/ precedes /*'() {
    const routes = ['/', '/*']
    const expectedRoutes = ['/', '/*']
    const sortedRoutes = sortByPrecedence(routes.map(fakeRoute))
    sortedRoutes.map(toPath).should.be.deep.eq(expectedRoutes)
  }

  @test
  async '/ precedes /* stable'() {
    const routes = ['/*', '/']
    const expectedRoutes = ['/', '/*']
    const sortedRoutes = sortByPrecedence(routes.map(fakeRoute))
    sortedRoutes.map(toPath).should.be.deep.eq(expectedRoutes)
  }

  @test
  async '/abc precedes /:a1'() {
    const routes = ['/:a1', '/abc']
    const expectedRoutes = ['/abc', '/:a1']
    const sortedRoutes = sortByPrecedence(routes.map(fakeRoute))
    sortedRoutes.map(toPath).should.be.deep.eq(expectedRoutes)
  }

  @test
  async '/abc/a precedes /abc/:b'() {
    const routes = ['/abc/a', '/abc/:b']
    const expectedRoutes = ['/abc/a', '/abc/:b']
    const sortedRoutes = sortByPrecedence(routes.map(fakeRoute))
    sortedRoutes.map(toPath).should.be.deep.eq(expectedRoutes)
  }

  // not a valid path therefore skipped as this is expected to fail
  @test.skip
  async '/aa precedes /aa*'() {
    const routes = ['/aa*', '/aa']
    const expectedRoutes = ['/aa', '/aa*']
    const sortedRoutes = sortByPrecedence(routes.map(fakeRoute))
    sortedRoutes.map(toPath).should.be.deep.eq(expectedRoutes)
  }
  @test
  async 'sorts complex routing right'() {
    const routes = [
      '/*',
      '/',
      '/:weirdId',
      '/api/schiff/*',
      '/api/:post',
      '/api/post',
      '/api/schiff/:a',
      '/api/schiff/*',
      '/api/:schiff/:a',
      '/api/:schiff/:b',
    ]
    const expectedRoutes = [
      '/',
      '/api/post',
      '/api/schiff/:a',
      '/api/schiff/*',
      '/api/schiff/*',
      '/api/:post',
      '/api/:schiff/:a',
      '/api/:schiff/:b',
      '/:weirdId',
      '/*',
    ]
    const sortedRoutes = sortByPrecedence(routes.map(fakeRoute))
    sortedRoutes.map(toPath).should.be.deep.eq(expectedRoutes)
  }
}
