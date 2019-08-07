// tslint:disable: member-ordering
import { SetMode } from '@seagull/mode'
import { TestScope } from '@seagull/seed'
import { Container } from 'inversify'
import { IBeforeAndAfterContext, IHookCallbackContext } from 'mocha'
import { context } from 'mocha-typescript'

export abstract class ServiceTest {
  @context private mocha!: IBeforeAndAfterContext & IHookCallbackContext

  abstract serviceModules: any[]
  abstract services: any[]
  injector = new Container()
  stateful = false

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
    if (this.stateful) {
      const suite = this.mocha.currentTest!.parent!.title
      const test = this.mocha.currentTest!.title
      this.injector
        .bind(TestScope)
        .toDynamicValue(() => new TestScope(suite, test))
    }
    for (const diMod of this.serviceModules) {
      this.injector.load(diMod)
    }
    for (const injectable of this.services) {
      this.injector.bind(injectable).toSelf()
    }
    this.beforeEach()
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
