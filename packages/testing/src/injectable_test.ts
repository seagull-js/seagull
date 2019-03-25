import { SetMode } from '@seagull/mode'
import { Container } from 'inversify'

export abstract class InjectableTest {
  abstract injectDiModules: any[]
  abstract inject: any[]
  injector = new Container()

  /** Implement your logic to run before each single test here!
   * if you override before(), you compromise internal logic of InjectableTest */
  // tslint:disable-next-line:no-empty
  beforeEach = () => {}

  /**
   * before every test, activate all given injectables/modules
   */
  before() {
    new SetMode('environment', 'pure').execute()
    this.injector = new Container()
    for (const diMod of this.injectDiModules) {
      this.injector.load(diMod)
    }
    for (const injectable of this.inject) {
      this.injector.bind(injectable).toSelf()
    }
    this.beforeEach()
    return 'key'
  }

  /** Implement your logic to run after each single test here!
   * if you override after(), you compromise internal logic of InjectableTest */
  // tslint:disable-next-line:no-empty
  afterEach = () => {}

  /**
   * after every test, deactivate all injectables/modules
   */
  after() {
    for (const diMod of this.injectDiModules) {
      this.injector.unload(diMod)
    }
    for (const injectable of this.inject) {
      this.injector.unbind(injectable)
    }
    this.afterEach()
  }
}
