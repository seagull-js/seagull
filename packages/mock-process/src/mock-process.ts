import { Mock } from '@seagull/mock'
import * as pmock from 'pmock'

/**
 * when activated, redirect all calls of node.js' 'process' module to  a
 * provided fake implementation, or if not modified, to the original method
 */
export class Process implements Mock {
  /**
   * methods (and handlers/values) to override
   */
  fakeImplementations: { [key: string]: any }

  // hold references to the mocked functions
  private instances: any[] = []

  /**
   * create a new instance
   */
  constructor(fakeImplementations: { [key: string]: any }) {
    this.fakeImplementations = fakeImplementations
  }

  /**
   * redirect process library interactions to fake implementations
   */
  activate = () => {
    const keys = Object.keys(this.fakeImplementations)
    this.instances = keys.map(key => pmock[key](this.fakeImplementations[key]))
  }

  /**
   * restore original process behavior
   */
  deactivate = () => {
    this.instances.forEach(instance => instance.reset())
  }

  /**
   * resets but does not deactivate
   */
  reset = () => {
    this.instances.forEach(instance => instance.reset())
    this.activate()
  }
}
