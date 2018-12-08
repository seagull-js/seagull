import { BasicTest } from '../../../../packages/testing/dist/src'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as Enzyme from 'enzyme'
import * as React from 'react'
import AsyncFetchingMobx from '../../src/pages/AsyncFetchingMobx'
import { NetworkLayer } from '../../src/store/NetworkLayer'
import { PageTest } from '@seagull/pages/src'

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

@suite('AsyncFetchingMobx')
export class AsyncFetchingTest extends PageTest {
  page = AsyncFetchingMobx
  @test
  @timeout(5000)
  async 'can render page with any data'() {
    const mockedAsyncFunction = () => Promise.resolve(mockData)
    const networkLayer = new NetworkLayer(mockedAsyncFunction)
    const data: any = { someProperty: 'Schinken!' }
    this.mount({ data, networkLayer })
    const dataField = this.wrapper.find('#data-field')
    dataField.text().should.contain(JSON.stringify(data))
    this.wrapper.find('button').simulate('click')
    await this.update()
    const updatedDataField = this.wrapper.find('#data-field')
    updatedDataField.text().should.contain(JSON.stringify(mockData))
  }
}
