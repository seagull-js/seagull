import { ReadLog } from '@seagull/commands-logging'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export default class extends Route {
  static method: HttpMethod = 'POST'
  static path = '/log/getLogs'

  static async handler(this: RouteContext) {
    const { logStreamName } = this.request.body

    const command = new ReadLog({ logStreamName })
    await command.execute()

    const orig = command.getOriginalLogWithTimestamps()

    return this.json(orig)
  }
}
