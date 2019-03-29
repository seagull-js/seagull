import { SetMode } from '@seagull/mode'
import { Container } from 'inversify'

export abstract class ServiceTest {
  abstract serviceModules: any[]
  abstract services: any[]
  injector = new Container()

  /** Implement your logic to run before each single test here!
   * if you override before(), you compromise internal logic of InjectableTest */
  beforeEach() {
    /** empty */
  }

  /**
   * before every test, activate all given injectables/modules
   */
  before() {
    new SetMode('environment', 'pure').execute()
    this.injector = new Container()
    for (const diMod of this.serviceModules) {
      this.injector.load(diMod)
    }
    for (const injectable of this.services) {
      this.injector.bind(injectable).toSelf()
    }
    this.beforeEach()
    return 'key'
  }

  /** Implement your logic to run after each single test here!
   * if you override after(), you compromise internal logic of InjectableTest */
  afterEach() {
    /** empty */
  }

  /**
   * after every test, deactivate all injectables/modules
   */
  after() {
    for (const diMod of this.serviceModules) {
      this.injector.unload(diMod)
    }
    for (const injectable of this.services) {
      this.injector.unbind(injectable)
    }
    this.afterEach()
  }
}
