import { App, createStore, Page, Registry, ssr } from '@frontend/index'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'

class DemoPage extends Page {
  path = '/demo/:id'
  title = 'Demo'
  html() {
    const { id, q } = this.props.params
    return (
      <div>
        demo: {id}, q: {q}
      </div>
    )
  }
}

class LinkTestPage extends Page {
  path = '/links'
  html() {
    return (
      <div>
        <this.Link pageName="DemoPage" params={{ id: 17 }}>
          goto demo
        </this.Link>
      </div>
    )
  }
}

const NumberStore = createStore({
  actions: { inc: store => ({ counter: store.state.counter + 1 }) },
  getters: {},
  name: 'number',
  state: { counter: 0 },
})

class NumberPage extends Page {
  path = '/number'
  html() {
    return (
      <NumberStore.Provider>
        <NumberStore.Consumer>
          {store => <p>{store.state.counter}</p>}
        </NumberStore.Consumer>
      </NumberStore.Provider>
    )
  }
}

@suite('Unit::Frontend::App')
class Test {
  before() {
    require('clear-require').match(/\.tsx?/)
    Registry.reset()
  }

  @test
  async 'app routing works with parameterized pages'() {
    const app = new App().register(DemoPage)
    const html = await ssr(app, '/demo/17?q=test')
    html.should.contain('demo: <!-- -->17')
    html.should.contain('q: <!-- -->test')
  }

  @test
  async 'app can generate named url'() {
    const app = new App().register(DemoPage)
    const urlParams = { id: 17, q: 'test' }
    app.url('DemoPage', urlParams).should.be.equal('/demo/17?q=test')
  }

  @test
  async 'pages can generate links within template from app context'() {
    const app = new App().register(DemoPage).register(LinkTestPage)
    const html = await ssr(app, '/links')
    html.should.contain('<a href="/demo/17">goto demo</a>')
  }

  @test
  async 'stores are registered during SSR'() {
    const app = new App().register(NumberPage)
    const response = await ssr(app, '/number')
    response.should.contain('<p>0</p>')
    response.should.contain('script>window.__initial_state__ =')
    const states = Registry.collectStates()
    states.number.should.be.deep.equal({ counter: 0 })
  }

  @test
  async 'stores are prefilled with initial state if existing'() {
    const app = new App().register(NumberPage)
    Registry.initialStates = { number: { counter: 2 } }
    const response = await ssr(app, '/number')
    response.should.contain('<p>2</p>')
    response.should.contain('{"number":{"counter":2}}')
    const states = Registry.collectStates()
    states.number.should.be.deep.equal({ counter: 2 })
  }
}
