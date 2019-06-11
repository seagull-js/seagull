import { Page } from '@seagull/pages'
import * as React from 'react'

export default class HookPage extends Page {
  html() {
    return (
      <NoSsr>
        <HookTest />
      </NoSsr>
    )
  }
}

export function HookTest() {
  const [count, setCount] = React.useState(0)
  const increase = () => setCount(count + 1)
  return <button onClick={increase}>{count}</button>
}

// NoSsr extracted from material-ui:
// https://github.com/mui-org/material-ui/blob/08828d508553a2d3215999f389f570090556a1ce/packages/material-ui/src/NoSsr/NoSsr.js

class NoSsr extends React.Component<any> {
  static defaultProps = {
    defer: false,
    fallback: null,
  }

  mounted = false

  state = {
    mounted: false,
  }

  componentDidMount() {
    this.mounted = true

    if (this.props.defer) {
      // Wondering why we use two RAFs? Check this video out:
      // https://www.youtube.com/watch?v=cCOL7MC4Pl0
      //
      // The componentDidMount() method is called after the DOM nodes are inserted.
      // The UI might not have rendering the changes. We request a frame.
      requestAnimationFrame(() => {
        // The browser should be about to render the DOM nodes
        // that React committed at this point.
        // We don't want to interrupt. Let's wait the next frame.
        requestAnimationFrame(() => {
          // The UI is up-to-date at this point.
          // We can continue rendering the children.
          if (this.mounted) {
            this.setState({ mounted: true })
          }
        })
      })
    } else {
      this.setState({ mounted: true })
    }
  }

  componentWillUnmount() {
    this.mounted = false
  }

  render() {
    const { children, fallback } = this.props

    return this.state.mounted ? children : fallback
  }
}
