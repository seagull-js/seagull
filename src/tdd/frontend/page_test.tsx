/** @module TDD */
import 'chai/register-should'
import { App, IPageProps, Page, Registry, ssr } from '../../frontend'

/**
 * When used in combination with the mocha-typescript decorators, this class
 * can help you to test your [[Page]] classes. Example:
 *
 * ```typescript
 * import 'chai/register-should'
 * import { skip, slow, suite, test, timeout } from 'mocha-typescript'
 * import { PageTest } from '@seagull/framework'
 * import YourPage from 'path/to/your/page'
 *
 * @suite('Unit::Page::YourPage')
 * class Test extends PageTest<YourPage> {
 *   page = YourPage
 *
 *   @test
 *   async 'does work'() {
 *     this.instance().path.should.be.equal('/some/path')
 *     this.html('/some/path').should.contain('my page title')
 *   }
 * }
 * ```
 */
export abstract class PageTest<T extends Page> {
  /**
   * the class of the page you want to test within this suite
   */
  abstract page: { register: any; new (props: IPageProps): T }

  /**
   * a list of additional pages that are needed to render your page (for
   * example) when using the [[link]] utility.
   */
  referencedPages: Array<{ register: any; new (props: IPageProps): T }> = []

  /**
   * a list of stores your page needs to render properly
   */
  withStores: any[] = []

  /**
   * Get an instance of the [[page]] class, useful for testing methods and
   * properties in isolation. Accepts optional parameters to fake routing
   * environment.
   */
  instance(path: string = '/', params: any = {}, baseUrl: string = '/') {
    const baseParams = { baseUrl, params, path }
    return new this.page(baseParams)
  }

  /**
   * Get the rendered HTML output of the page when invoked with a [[path]]. You
   * should set the path parameter to the configured path of the [[page]], but
   * you can also provide parameters, like `?id=17`.
   */
  async html(path?: string) {
    const pagePath = path || this.instance().path
    return ssr(this.app(), pagePath)
  }

  /**
   * This handler will be called before each test in the suite executes and will
   * reset all stores to their default state.
   */
  before() {
    require('clear-require').match(/\.tsx?/)
    Registry.reset()
  }

  private app() {
    const app = new App()
    this.withStores.forEach(store => app.register(store as any))
    app.register(this.page)
    this.referencedPages.forEach(page => app.register(page))
    return app
  }
}
