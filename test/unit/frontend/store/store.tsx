// import 'jsdom-global/register'
import { Actions, createStore, Getters } from '@frontend/index'
import 'chai/register-should'
import { configure, mount, render } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'

configure({ adapter: new Adapter() })

@suite('Unit::Frontend::Store')
class Test {
  @test
  async 'can be created and mounted into the DOM'() {
    const name = 'empty'
    const state = { a: 1 }
    const getters: Getters<typeof state> = {}
    const actions: Actions<typeof state> = {}
    const props = { state, getters, actions, name }
    const { Consumer, Provider } = createStore(props)
    const wrapper = render(
      <Provider>
        <Consumer>{store => <p>{store.state.a}</p>}</Consumer>
      </Provider>
    )
    wrapper.text().should.be.equal('1')
  }

  @test
  async 'stores have real names'() {
    const name = 'nameChecker'
    const state = { a: 1 }
    const getters: Getters<typeof state> = {}
    const actions: Actions<typeof state> = {}
    const props = { state, getters, actions, name }
    const { Consumer, Provider } = createStore(props)
    const store = new Provider({})
    store.name.should.be.equal('nameChecker')
  }

  @test
  async 'getters work and can reference each other'() {
    const name = 'getterChecker'
    const state = { a: 1 }
    const getters: Getters<typeof state> = {
      doubled: (s, view) => view('stringified') + view('stringified'),
      plusX: (s, view, x) => s.a + x,
      stringified: s => JSON.stringify(s.a),
    }
    const actions: Actions<typeof state> = {}
    const props = { state, getters, actions, name }
    const { Consumer, Provider } = createStore(props)
    const store = new Provider({})
    store.view('doubled').should.be.equal('11')
    store.view('plusX', 1).should.be.equal(2)
  }

  @test
  async 'getters reset their cache on state changes'() {
    const name = 'getterActions'
    const state = { a: 1 }
    const getters: Getters<typeof state> = {
      stringified: s => JSON.stringify(s.a),
    }
    const actions: Actions<typeof state> = {
      increment: s => ({ a: s.state.a + 1 }),
    }
    const props = { state, getters, actions, name }
    const { Consumer, Provider } = createStore(props)
    const store = new Provider({})
    store.view('stringified').should.be.equal('1')
    store.setState = (value: typeof state) => (store.state = value)
    await store.dispatch('increment')
    store.view('stringified').should.be.equal('2')
  }

  @test
  async 'can wrap components and add itself to props'() {
    const name = 'wrapper'
    const state = { a: 1 }
    const getters: Getters<typeof state> = {}
    const actions: Actions<typeof state> = {}
    const { connect } = createStore({ state, getters, actions, name })
    const Dummy = (props: any) => <pre>{JSON.stringify(props)}</pre>
    const Wrapped = connect(Dummy)
    const instance = render(<Wrapped />)
    const expectedResult = '{"wrapper":{"state":{"a":1},"name":"wrapper"}}'
    instance.text().should.be.equal(expectedResult)
  }
}
