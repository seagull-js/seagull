import { WriteLog } from '@seagull/commands-logging'
import { WriteLogRequest } from '@seagull/libraries'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export default class extends Route {
  static method: HttpMethod = 'POST'
  static path = '/log/writeLog'

  static async handler(this: RouteContext) {
    const { logStreamName, log, logLevel }: WriteLogRequest = this.request.body

    const result = await new WriteLog({
      logStreamName,
      log,
      logLevel,
    }).execute()

    return this.json(result)
  }
}
