import { LogLevel, Message, WriteLog } from '@seagull/commands-logging'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export interface WriteLogRequest {
  logStreamName: string
  log: Message
  logLevel?: LogLevel
}

export default class extends Route {
  static method: HttpMethod = 'POST'
  static path = '/log/writeLog'

  static async handler(this: RouteContext) {
    const { logStreamName, log, logLevel }: WriteLogRequest = this.request.body

    const result = await new WriteLog(logStreamName, log, logLevel).execute()

    return this.json(result)
  }
}
