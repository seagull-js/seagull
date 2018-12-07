import { Page, IPageProps } from '@seagull/pages'
import { mount, ReactWrapper } from 'enzyme'
import * as React from 'react'
import { BasicTest } from '../../../../packages/testing/dist/src'

const mountFirstError = (impossibleAction: string) => {
  const msg = `
  You must call this.mount() before you ${impossibleAction} in your PageTest`
  throw new Error(msg)
}
type ResolveFunction = (value?: {} | PromiseLike<{}> | undefined) => void
export abstract class PageTest extends BasicTest {
  abstract page: typeof Page
  private mountedPage?: ReactWrapper
  /** An Enzyme Wrapper representing the mounted Page. Call this.mount(pageProps)
   * before accessing this.wrapper in case you don't want to have your Page
   * mounted with the default Properties { data: {} } */
  get wrapper() {
    if (!this.page) {
      // Required because of mocha warmup phase
      return {} as ReactWrapper
    }
    if (!this.mountedPage) {
      this.mount()
    }
    return this.mountedPage!
  }

  /** Mounts your Page with custom props. After that you can access it with
   * this.wrapper. The return value is the same as this.wrapper
   * @param pageProps The initial props you want to mount your page with - { data: {} } by default
   * @return An Enzyme Wrapper representing the mounted Page. */
  mount = (pageProps: any & IPageProps = { data: {} }) => {
    this.mountedPage = mount(<this.page {...pageProps} />)
    return this.mountedPage
  }

  /** After you mounted the page, call `await this.update()` after triggering
   * (mocked) asynchronous actions inside the page */
  update() {
    if (!this.mountedPage || !this.mountedPage.children().length) {
      mountFirstError('await this.update()')
    }
    return new Promise(this.resolveAfterUpdate) //issue(this.wrapper!.update)
  }

  before() {
    this.activateMocks()
  }
  after() {
    this.deactivateMocks()
  }
  private resolveAfterUpdate = (resolve: ResolveFunction) => {
    setImmediate(() => {
      this.wrapper.update()
      resolve()
    })
  }
}
