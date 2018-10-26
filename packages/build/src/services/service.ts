import { Command } from '@seagull/commands'

export abstract class Service {
  // TODO: use the real constructor types instead of any for ...args here
  static async create<T extends Service>(
    this: { new (...args: any): T },
    ...args: any
  ) {
    const instance = new this(...args)
    await instance.initialize()
    return instance
  }

  list: { [key: string]: Command } = {}

  register(key: string, cmd: Command) {
    this.list[key] = cmd
  }

  remove(key: string) {
    delete this.list[key]
  }

  async processOne(key: string) {
    await this.list[key].execute()
  }

  async processAll() {
    // TODO: revert all processed in case of error
    for (const key of Object.keys(this.list)) {
      // const startTime = new Date().getTime()
      await this.list[key].execute()
      // const endTime = new Date().getTime()
      // tslint:disable-next-line:no-console
      // console.log(
      //   `${this.list[key].constructor.name}: ${key} -- ${endTime - startTime}ms`
      // )
    }
  }

  abstract async initialize(): Promise<void>
}
