import { injectable } from 'inversify'
import 'reflect-metadata'
import slugify from 'slugify'

const cfg = {
  lower: true,
  remove: /[*+~.()'"!:@]/g,
}

@injectable()
export class TestScope {
  constructor(
    readonly suiteName?: string,
    readonly testName?: string,
    public callIndex = 0
  ) {}
  get path() {
    const suite = this.suiteName ? `/suite-${slugify(this.suiteName, cfg)}` : ''
    const test = this.testName ? `/${slugify(this.testName, cfg)}` : ''
    const path = `${suite}${test}/request-${this.callIndex}`
    return path
  }
}
