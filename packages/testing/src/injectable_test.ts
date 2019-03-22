import { httpDiModule } from '@seagull/http'
import { SetMode } from '@seagull/mode'
import { Container } from 'inversify'

export abstract class InjectableTest {
  diModules = [httpDiModule]
  abstract inject: any[]
  injector = new Container()

  /**
   * before every test, activate all given mocks
   */
  before() {
    new SetMode('environment', 'pure').execute()
    this.injector = new Container()
    for (const diMod of this.diModules) {
      this.injector.load(diMod)
    }
    for (const injectable of this.inject) {
      this.injector.bind(injectable).toSelf()
    }
    if (typeof (this as any).beforeEach === 'function') {
      ;(this as any).beforeEach()
    }
    return 'key'
  }

  /**
   * after every test, deactivate all mocks in reverse order
   */
  after() {
    for (const diMod of this.diModules) {
      this.injector.unload(diMod)
    }
    for (const injectable of this.inject) {
      this.injector.unbind(injectable)
    }
    if (typeof (this as any).afterEach === 'function') {
      ;(this as any).afterEach()
    }
  }
}
