import { mount, ReactWrapper } from 'enzyme'
import * as React from 'react'
import { BasicTest } from '../../testing/dist/src'
import { IPageProps, Page } from './'

const mountFirstError = (impossibleAction: string) => {
  const msg = `
  You must call this.mount() before you ${impossibleAction} in your PageTest`
  throw new Error(msg)
}
type ResolveFunction = (value?: {} | PromiseLike<{}> | undefined) => void

/**
 * To test a page, extend this class, implement Page (Page = MyFancyPageClass),
 * optionally fill the mocks property (mocks = ...) to mock async actions and
 * use the provided functions:
 *  - this.mount(pageProps) mounts the page with custom pageProps and provides...
 *  - ...an Enzyme wrapper you can access by this.page(). If you don't
 *    this.mount(pageProps) the page before, it is done automagically with
 *    pageProps = {data: {}}. Enzyme related functions can be accessed by this.
 *  - if some asynchronous things are going on inside the page, call
 *    await this.update().
 *    TODO: (fake timer implementation is missing)
 *    if you need to test some timed events, call await this.update(ms), where
 *    ms is the amount of milliseconds you need to wait before your assertion.
 */
export abstract class PageTest extends BasicTest {
  abstract Page: typeof Page
  private mountedPage?: ReactWrapper

  /** An Enzyme Wrapper representing the mounted Page. Call this.mount(pageProps)
   * before accessing this.page in case you don't want to have your Page
   * mounted with the default Properties { data: {} }
   */
  get page() {
    const getMountedPage = () =>
      this.mountedPage ? this.mountedPage : this.mount()
    return this.Page ? getMountedPage() : ({} as ReactWrapper)
  }

  /** Mounts your Page with custom props. After that you can access it with
   * this.page. The return value is the same as this.page
   */
  mount = (pageProps: any & IPageProps = { data: {} }) => {
    this.mountedPage = mount(<this.Page {...pageProps} />)
    return this.mountedPage
  }

  /** After you mounted the page, call `await this.update()` after triggering
   * (mocked) asynchronous actions inside the page. If you expect timed changes
   */
  update(ms: number = 0) {
    if (!this.mountedPage) {
      mountFirstError('await this.update()')
    }
    return new Promise(this.resolveAfterUpdate(ms))
  }

  before() {
    this.activateMocks()
  }
  after() {
    this.deactivateMocks()
  }
  private resolveAfterUpdate = (ms: number) => (resolve: ResolveFunction) =>
    setTimeout(() => {
      this.page.update()
      resolve()
    }, ms)
}
