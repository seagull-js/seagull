import { Typings } from '@seagull/libraries'
import PublicProperties = Typings.PublicProperties
import SubclassConstructor = Typings.SubclassConstructor

import * as CV from 'class-validator'
import { Request } from 'express'

const throwError = (msg: string) => {
  throw new Error(msg)
}

/**
 * Little Helper class which may be used to document Route params
 * A Subclass may use the class validator in order to get runtime validation
 */
export abstract class RouteRequestProps {
  /**
   * Takes an object and returns an instace of the subclass with the properties assigned. Tries to validate properties with class validator
   * @param this alias to the subclass constructor; injected by typescript
   * @param props Public Properties of the Subclass
   * @param clsArgs REST Constructor params of the subclass
   */
  static create<RCls extends SubclassConstructor<RCls, RouteRequestProps>>(
    this: RCls,
    props: PublicProperties<RCls>,
    ...clsArgs: ConstructorParameters<RCls>
  ): InstanceType<RCls> {
    const instance = new this(...clsArgs)
    Object.assign(instance, props).ensureValid()
    return instance
  }

  /**
   *  Takes a Request object and tries to merge its params into an instance of the RouteRequestProps class
   * @param this alias to the subclass constructor; injected by typescript
   * @param request Express Request object
   * @param clsArgs REST Constructor params of the subclass
   */
  static fromRequest<RCls extends SubclassConstructor<RCls, RouteRequestProps>>(
    this: RCls & typeof RouteRequestProps,
    request: Request,
    ...clsArgs: ConstructorParameters<RCls>
  ): InstanceType<RCls> {
    const params = { ...request.params, ...request.query, ...request.body }
    return this.create(params, ...clsArgs)
  }

  /**
   * Validates the instance. Throws if not valid
   */
  ensureValid() {
    const validation = CV.validateSync(this)
    const isValid = validation.length === 0
    // tslint:disable-next-line:no-unused-expression
    isValid || throwError('invalid instance')
  }
}
