import { CreateStream } from '@seagull/commands-logging'
import { HttpMethod, Route, RouteContext } from '@seagull/routes'

export interface CreateStreamRequest {
  logStreamName: string
}

export default class extends Route {
  static method: HttpMethod = 'POST'
  static path = '/log/createStream'

  static async handler(this: RouteContext) {
    const { logStreamName }: CreateStreamRequest = this.request.body

    const result = await new CreateStream({ logStreamName }).execute()

    return this.json(result)
  }
}
