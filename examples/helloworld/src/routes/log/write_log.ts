import { LogLevel, Message, WriteLog } from '@seagull/commands-logging'
import { Mode, SetMode } from '@seagull/mode'
import { Route, RouteContext } from '@seagull/routes'

export interface WriteLogRequest {
  logStreamName: string
  log: Message
  logLevel?: LogLevel
}

export default class extends Route {
  static method = 'post'
  static path = '/log/writeLog'

  static async handler(this: RouteContext) {
    const { logStreamName, log, logLevel }: WriteLogRequest = this.request.body
    const result = await new WriteLog(logStreamName, log, logLevel).execute()

    return this.json(result)
  }
}
