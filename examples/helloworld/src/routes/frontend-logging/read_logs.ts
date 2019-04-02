import { ReadLog } from '@seagull/commands-logging'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export default class extends Route {
  static method: HttpMethod = 'GET'
  static path = '/log/:id'

  static async handler(this: RouteContext) {
    const logStreamName: string = this.request.params.id

    const result = await new ReadLog({ logStreamName }).execute()

    return this.json(result)
  }
}
