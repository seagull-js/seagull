type NonFunctionPropertyNames<T> = {
  // tslint:disable-next-line:ban-types
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>
// prettier-ignore
export type PublicProperties<T extends new (...args: any) => any> =
    NonFunctionProperties<InstanceType<T>>

// prettier-ignore
export type Constructor<C extends {new (...args: any[]) => InstanceType<C>}> =
                             {new (...args: any[]) => InstanceType<C>, [key in C]:C[key]}

// prettier-ignore
export type SubclassConstructor<C extends Constructor<C>, T> =
                             {new (...args: any[])} => InstanceType<C> & T
