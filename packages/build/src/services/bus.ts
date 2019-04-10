import { EventEmitter } from 'events'
const noop = () => true
/**
 * Typesafe generic event bus extending standard EventEmitter
 * Adds some convenience functions for interaction and testing.
 */
export class ServiceEventBus<ServiceEvents extends any> extends EventEmitter {
  constructor() {
    super()
  }

  /**
   * Overrides EventEmitter.on, adding types
   */
  on = <T extends keyof ServiceEvents>(event: T, func: ServiceEvents[T]) => {
    return super.on((event as unknown) as string, func as any)
  }
  /**
   * Overrides EventEmitter.emit, adding types
   */
  emit<
    T extends keyof ServiceEvents,
    params extends ServiceEvents[T] extends (...args: infer U) => any
      ? U
      : never
  >(event: T, ...args: params) {
    return super.emit((event as unknown) as string, ...args)
  }

  /**
   * Lets you wait for an event once.
   * Returns the resolved args but also provides a callback.
   */
  async promisifyEmitOnce<
    T extends keyof ServiceEvents,
    params extends ServiceEvents[T] extends (...args: infer U) => any
      ? U
      : never
  >(event: T, func: (...args: params) => void = noop): Promise<params> {
    const resolver = (resolve: any) => (...args: any) => {
      func(...args)
      resolve(args)
    }
    return new Promise<params>(resolve =>
      this.once(event as any, resolver(resolve))
    )
  }
}
