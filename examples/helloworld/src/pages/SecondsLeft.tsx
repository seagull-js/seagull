import * as React from 'react'
import { Page } from '@seagull/pages'

export default class SecondsLeft extends Page {
  state = { secondsLeft: this.props.data.seconds || 50 }
  html() {
    const { secondsLeft } = this.state
    const positiveNumberMessage = `You have ${secondsLeft} seconds left to see what happens after that.`
    const below1Message =
      'AIDAnova has been christened - someone has to turn off the timer by Hand. ' +
      secondsLeft

    return (
      <div id="text-with-seconds">
        {secondsLeft > 0 ? positiveNumberMessage : below1Message}
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
