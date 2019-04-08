import {
  addLog,
  AddLogRequest,
  createStream,
  getLog,
  GetLogsRequest,
} from '@seagull/libraries'
import { Page } from '@seagull/pages'
import * as moment from 'moment'
import * as React from 'react'

export default class Logging extends Page {
  state = {
    counter: 0,
    fullStreamName: '',
    result: [],
  }

  sequenceToken: string | undefined

  html() {
    return (
      <div>
        <div>Counter: {this.state.counter}</div>
        <p>
          <button onClick={() => this.addLog('button1')}>Log Something</button>
        </p>
        <p>
          <button onClick={() => this.addLog('button2')}>
            Log Something else
          </button>
        </p>
        <p>
          {this.state.fullStreamName && (
            <button onClick={this.getLog}>Get Logs</button>
          )}
        </p>
        <ul>
          {this.state.result.map((item: any, key) => (
            <li key={item.timestamp}>{this.formatItem(item)}</li>
          ))}
        </ul>
        <div />
      </div>
    )
  }
  addLog = async (id: string) => {
    this.setState({
      counter: this.state.counter + 1,
      fullStreamName: this.state.fullStreamName || (await this.createStream()),
    })
    const log: AddLogRequest = {
      log: id,
      logStreamName: this.state.fullStreamName,
      sequenceToken: this.sequenceToken,
    }

    const result = await addLog('/log/addLog', log)
    this.sequenceToken = result.nextSequenceToken
  }

  getLog = async () => {
    if (this.state.fullStreamName) {
      const params: GetLogsRequest = {
        logStreamName: this.state.fullStreamName,
      }
      const result = await getLog('/log/getLogs', params)
      this.setState({ result })
      this.sequenceToken = result.nextSequenceToken
    } else {
      throw new Error('no stream created')
    }
  }

  formatItem = (item: any) => {
    return `${item.message} => ${moment(item.timestamp).format(
      'DD.MM.YY - hh:mm:ss.SSS'
    )}`
  }

  createStream = async () => {
    return await createStream('/log/createStream', 'add-log-test')
  }
}
