import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { mount } from 'enzyme'
import AsyncFetching from '../../src/pages/AsyncFetching'
import * as React from 'react'

const mockData = {
  products: [
    { Name: 'Cheese', Price: 2.5, Location: 'Refrigerated foods' },
    { Name: 'Crisps', Price: 3, Location: 'the Snack isle' },
    { Name: 'Pizza', Price: 4, Location: 'Refrigerated foods' },
    { Name: 'Chocolate', Price: 1.5, Location: 'the Snack isle' },
    { Name: 'Self-raising flour', Price: 1.5, Location: 'Home baking' },
    { Name: 'Ground almonds', Price: 3, Location: 'Home baking' },
  ],
}

@suite('AsyncFetching')
export class AsyncFetchingTest extends BasicTest {
  @test
  @timeout(5000)
  async 'can render page with any data'() {
    const resolutions = {} as any
    const json = () => Promise.resolve(mockData)
    const fetchMock = () => Promise.resolve({ json })
    ;(global as any).fetch = fetchMock
    ;(window as any).fetch = fetchMock
    let data: any = { someProperty: 'Schinken!' }
    const wrapper = mount(<AsyncFetching data={data} />)
    wrapper
      .find('#data-field')
      .text()
      .should.contain(JSON.stringify(data))
    data = { name: 'Halleluja' }
    wrapper.setProps({ data })
    wrapper.text().should.contain('Halleluja')
    wrapper.find('button').simulate('click')
    resolutions.fetch = true
    resolutions.json = true
    await new Promise(resolve => {
      setTimeout(() => {
        wrapper.update()
        resolve()
      }, 500)
    })

    wrapper
      .find('#data-field')
      .text()
      .should.not.contain(JSON.stringify(data))
  }
}
