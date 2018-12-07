import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import AsyncFetching from '../../src/pages/AsyncFetching'
import { PageTest } from './PageTest'

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
export class AsyncFetchingTest extends PageTest {
  page = AsyncFetching
  @test
  @timeout(5000)
  async 'can render page with any data'() {
    const json = () => Promise.resolve(mockData)
    const fetchMock = () => Promise.resolve({ json })
    ;(global as any).fetch = fetchMock
    ;(window as any).fetch = fetchMock
    let data: any = { someProperty: 'Schinken!' }
    const wrapper = this.mount({ data })
    const propsField = wrapper.find('#props-field')
    propsField.text().should.contain(JSON.stringify(data))
    const dataField = wrapper.find('#data-field')
    dataField.text().should.contain(JSON.stringify(data))

    data = { name: 'Halleluja' }
    wrapper.setProps({ data })
    const updatedPropsField = wrapper.find('#props-field')
    updatedPropsField.text().should.contain('Halleluja')
    const notUpdatedDataField = wrapper.find('#data-field')
    notUpdatedDataField.text().should.not.contain('Halleluja')

    wrapper.find('button').simulate('click')
    await this.update()
    const updatedDataField = wrapper.find('#data-field')
    updatedDataField.text().should.be.equal(JSON.stringify(mockData))
  }
}
