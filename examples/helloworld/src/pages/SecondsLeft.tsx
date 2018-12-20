import * as React from 'react'
import { Page } from '@seagull/pages/dist/src/Page'

export default class SecondsLeft extends Page {
  state = { secondsLeft: this.props.data.seconds || 50 }
  html() {
    return (
      <div id="text-with-seconds">
        {this.state.secondsLeft > 0
          ? `You have ${
              this.state.secondsLeft
            } seconds left to see what happens after
        that.`
          : 'AIDAnova has been christened - someone has to turn off the timer by Hand.'}
      </div>
    )
  }
  componentDidMount() {
    setInterval(
      () =>
        this.setState(({ secondsLeft }: SecondsLeft['state']) => ({
          secondsLeft: secondsLeft - 1,
        })),
      1000
    )
  }
}
