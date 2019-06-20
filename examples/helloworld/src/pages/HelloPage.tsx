import { Page } from '@seagull/pages'
import * as React from 'react'

export default class HelloPage extends Page {
  html() {
    // tslint:disable-next-line:no-console
    console.log('rendering on client:', typeof window !== 'undefined')
    return (
      <div>
        Hello, {this.props.data.name}
        <HookTest />
      </div>
    )
  }
}

function HookTest() {
  const [count, setCount] = React.useState(0)
  const increase = () => setCount(count + 1)
  return <button onClick={increase}>{count}</button>
}
