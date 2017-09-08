/**
 * This is just a dummy frontend in one file
 */
import Component from 'inferno-component';
import createElement from 'inferno-create-element';
import { IndexRoute, Route, Router } from 'inferno-router';
import { history } from '../../../../lib/spa'

function wrapper ({ children }) {
  return <div>{ children }</div>
}

function NoMatch ({ children }) {
  return <div><b>catch-all.</b></div>
}

class MyComponent extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      counter: 0
    }
  }
  render() {
    return (
      <div>
        <h1>Header!</h1>
        <span>Counter is at: { this.state.counter }</span>
      </div>
    )
  }
}

const routes = (
  <Router history={ history }>
    <Route component={ wrapper }>
      <Route path='/' component={ MyComponent }/>
      <Route path='*' component={ NoMatch } />
    </Route>
  </Router>
)

export default routes