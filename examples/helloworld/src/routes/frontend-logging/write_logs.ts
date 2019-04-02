import { LogLevel, WriteLogs } from '@seagull/commands-logging'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export interface WriteLogsRequest {
  logStreamName: string
  logs: any[]
  logLevel?: LogLevel
}

export default class extends Route {
  static method: HttpMethod = 'POST'
  static path = '/log/writeLogs'

  static async handler(this: RouteContext) {
    const {
      logStreamName,
      logs,
      logLevel,
    }: WriteLogsRequest = this.request.body

    const result = await new WriteLogs(logStreamName, logs, logLevel).execute()

    return this.json(result)
  }
}
