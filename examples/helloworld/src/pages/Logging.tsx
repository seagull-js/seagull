import { Page } from '@seagull/pages'
import * as React from 'react'
import { WriteLogRequest } from '../routes/log/write_log'

export default class Logging extends Page {
  html() {
    return (
      <div>
        <button onClick={this.onClick}>Log Something</button>
        {/* <div id="data-field">{JSON.stringify(this.state.fetchedData)}</div> */}
      </div>
    )
  }
  onClick = async () => {
    const log: WriteLogRequest = {
      log: 'HIT',
      logStreamName: 'log-test',
    }
    const rawResponse = await fetch('/log/writeLog', {
      body: JSON.stringify(log),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })

    const content = await rawResponse.json()

    console.info('content', content)
  }
}
