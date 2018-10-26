import { Command } from '@seagull/commands'

export class Service {
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
}
