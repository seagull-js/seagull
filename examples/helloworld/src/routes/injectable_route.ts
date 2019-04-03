import { Route, RouteContext } from '@seagull/routes'
import { ContainerModule, injectable } from 'inversify'

@injectable()
class SomeDataRepository {
  async get(): Promise<string> {
    return 'some data'
  }
}

export default class IndexRoute extends Route {
  static path = '/'
  static dependencies = new ContainerModule(bind => {
    bind(SomeDataRepository).toSelf()
  })

  static async handler(this: RouteContext) {
    const repo = this.injector.get(SomeDataRepository)
    const data = await repo.get()
    this.html(data)
  }
}
