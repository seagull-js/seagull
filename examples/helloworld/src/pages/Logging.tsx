import { sendLog } from '@seagull/libraries'
import { Page } from '@seagull/pages'
import * as React from 'react'
import { AddLogRequest } from '../routes/frontend-logging/add_log'

export default class Logging extends Page {
  sequenceToken: string | undefined
  fullStreamName: string | undefined
  html() {
    return (
      <div>
        <button onClick={this.onClick}>Log Something</button>
      </div>
    )
  }
  onClick = async () => {
    this.fullStreamName = this.fullStreamName || (await this.createStream())
    const log: AddLogRequest = {
      log: 'HIT!',
      logStreamName: this.fullStreamName,
      sequenceToken: this.sequenceToken,
    }

    const result = await sendLog('/log/addLog', log)
    this.sequenceToken = result.nextSequenceToken
  }

  createStream = async () => {
    const stream = { logStreamName: 'add-log-test' }
    return (await sendLog('/log/createStream', stream)) as string
  }
}
