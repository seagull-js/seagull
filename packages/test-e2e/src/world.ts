// tslint:disable-next-line:no-var-requires
const zombie = require('zombie') as any
import { setWorldConstructor, World } from 'cucumber'

class ZombieWorld implements World {
  browser!: any
  constructor() {
    this.browser = new zombie({ runScripts: false })
  }
}
setWorldConstructor(ZombieWorld)
