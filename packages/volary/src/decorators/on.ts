import { Event } from '../events'
import { Message } from '../message'

export function on<T extends Message>(msg: T) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    const name = (msg as any).name
    // tslint:disable-next-line:no-console
    console.log('registering: ', name)
    const invoke = (props: T) => originalMethod.value(props)
    const handler = (event: CustomEvent<T>) => invoke(event.detail)
    Event.on(name, handler as any)
  }
}
