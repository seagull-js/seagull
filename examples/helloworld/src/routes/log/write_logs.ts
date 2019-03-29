import { LogLevel, WriteLogs } from '@seagull/commands-logging'
import { Route, RouteContext } from '@seagull/routes'

export interface WriteLogRequest {
  logStreamName: string
  logs: any[]
  logLevel?: LogLevel
}

export default class extends Route {
  static method = 'post'
  static path = '/log/writeLogs'

  static async handler(this: RouteContext) {
    const { logStreamName, logs, logLevel }: WriteLogRequest = this.request.body

    const result = await new WriteLogs(logStreamName, logs, logLevel).execute()

    return this.json(result)
  }
}
