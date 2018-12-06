import { Page, IPageProps } from '@seagull/pages'
import { mount, ReactWrapper } from 'enzyme'
import * as Enzyme from 'enzyme'
import * as React from 'react'
import { BasicTest } from '../../../../packages/testing/dist/src'

const issue = (funct: Function) =>
  new Promise(resolve =>
    setImmediate(() => {
      funct()
      resolve()
    })
  )

const mountFirstError = (impossibleAction: string) => {
  const msg = `You must call this.mount() before you ${impossibleAction}`
  throw new Error(msg)
}
export abstract class PageTest extends BasicTest {
  abstract page: typeof Page
  private mountedWrapper: ReactWrapper = mount(<div />)
  /** An Enzyme Wrapper representing the mounted Page -
   * must be mounted by calling this.mount(pageProps) */
  get wrapper() {
    if (this.mountedWrapper === undefined) {
      mountFirstError('access this.wrapper')
    }
    return this.mountedWrapper
  }

  mount = (pageProps: any & IPageProps = { data: {} }) => {
    console.log(pageProps)
    console.log(this.mountedWrapper)

    this.mountedWrapper = mount(<this.page {...pageProps} />)
    console.log(this.mountedWrapper.html())
  }

  /** call await this.update() after invoking asynchronous actions
   * inside the page*/
  async update() {
    if (!this.mountedWrapper) {
      mountFirstError('await this.update()')
    }
    return await issue(this.wrapper.update)
  }

  before() {
    this.activateMocks()
  }
  after() {
    this.deactivateMocks()
  }
}
