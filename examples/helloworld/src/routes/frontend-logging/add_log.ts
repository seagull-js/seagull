import { AddLog } from '@seagull/commands-logging'
import { AddLogRequest } from '@seagull/libraries'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

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

    const result = await new AddLog({
      log,
      logLevel,
      logStreamName,
      sequenceToken,
    }).execute()

    return this.json(result)
  }
}
