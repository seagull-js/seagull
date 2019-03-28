import { Command } from './Command'

/**
 * A Service manages a bag of initialized Command instances and can process them
 * all or partially as often as you want.
 */
export abstract class CommandService {
  /**
   * Static constructor that returns a new service instance with the
   * [[initialize]] method already applied.
   */
  static async create<T extends CommandService>(
    this: new (...args: any) => T,
    ...args: any
  ) {
    const instance = new this(...args)
    await instance.initialize()
    return instance
  }

  /**
   * the internal list of registered commands, implemented as an object
   * instead of a plain array for precise selection of a subset of commands
   */
  list: { [key: string]: Command } = {}

  /**
   * Register an initialzed command instance with a specific key
   */
  register(key: string, cmd: Command) {
    this.list[key] = cmd
  }

  /**
   * Remove a command from [[list]], specified by the key
   */
  remove(key: string) {
    delete this.list[key]
  }

  /**
   * execute exactly one command by key, once
   */
  async processOne(key: string) {
    return await this.list[key].execute()
  }

  /**
   * execute all commands in the list one-after-another. The ordering is the
   * sorted key list.
   */
  async processAll() {
    const results: any[] = []
    // TODO: revert all processed in case of error
    for (const key of Object.keys(this.list)) {
      const result = await this.list[key].execute()
      results.push(result)
    }
    return results
  }

  /**
   * execute all commands in the list one-after-another. The ordering is the
   * sorted key list. Same as [[processAll]] but with whitelisted keys.
   */
  async processOnly(keys: string[]) {
    const results: any[] = []
    // TODO: revert all processed in case of error
    for (const key of Object.keys(this.list)) {
      if (keys.includes(key)) {
        const result = await this.list[key].execute()
        results.push(result)
      }
    }
    return results
  }

  /**
   * execute all commands in the list one-after-another. The ordering is the
   * sorted key list. Same as [[processAll]] but with blacklisted keys.
   */
  async processWithout(keys: string[]) {
    const results: any[] = []
    // TODO: revert all processed in case of error
    for (const key of Object.keys(this.list)) {
      if (!keys.includes(key)) {
        const result = await this.list[key].execute()
        results.push(result)
      }
    }
    return results
  }

  abstract async initialize(): Promise<void>
}
