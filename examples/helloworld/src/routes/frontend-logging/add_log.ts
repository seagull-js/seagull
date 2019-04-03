import { AddLog, LogLevel, Message } from '@seagull/commands-logging'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export interface AddLogRequest {
  logStreamName: string
  log: Message
  logLevel?: LogLevel
  sequenceToken?: string
}

export default class extends Route {
  static method: HttpMethod = 'POST'
  static path = '/log/addLog'

  static async handler(this: RouteContext) {
    const {
      logStreamName,
      log,
      sequenceToken,
      logLevel,
    }: AddLogRequest = this.request.body

    const result = await new AddLog(
      logStreamName,
      log,
      sequenceToken!,
      logLevel
    ).execute()

    return this.json(result)
  }
}
