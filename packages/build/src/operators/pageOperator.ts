import * as buildEnv from '../lib/environment'
import { listPages } from '../lib/project'
import * as E from '../services'
import { LogEvent, PageBundleService as PageService } from '../services'
import { Operator, Wiring } from './operator'

export class PageOperator extends Operator {
  static StartEvent = Symbol('Page Operator start Event')
  pages: PageService[] = []
  backlog: string[] = []
  bundled = new Set<string>()
  bundleTimer?: [number, number]
  config: Partial<PageService['config']> & { pagesToExclude?: string } = {}
  constructor(
    parent: Operator,
    config?: Partial<PageService['config']> & { pagesToExclude?: string }
  ) {
    super(parent)
    Object.assign(this.config, config)
    this.parent!.on(PageOperator.StartEvent, this.bundleAll)
    this.on(E.BundledPageEvent, this.handleBundled)
    this.on(E.LogEvent, (this.parent as any).emit.bind(this.parent, LogEvent))
  }

  bundleAll = () => {
    this.bundleTimer = process.hrtime()
    const exclusionRegEx = this.config.pagesToExclude
    listPages(process.cwd())
      .filter(page => (exclusionRegEx ? !page.match(exclusionRegEx) : true))
      .filter((p, index) => buildEnv.coreRoundRobin(index))
      .forEach(this.addPage)
    buildEnv.callPerCore(this.bundleNext)
  }

  addPage = (page: string) =>
    this.pages.push(new PageService(this, { page, ...this.config })) &&
    this.backlog.push(page)

  handleBundleRequested = (page: string) => this.emit(E.BundlePageEvent, page)
  bundleNext = () => this.handleBundleRequested(this.backlog.pop()!)

  handleBundled = (page: string) => {
    this.bundled.add(page)
    if (this.bundled.size !== this.pages.length) {
      this.bundleNext()
      return
    }
    this.parent!.emit(PageOperator.DoneEvent)
    const time = process.hrtime(this.bundleTimer)
    this.parent!.emit(LogEvent, 'PageOperator', 'Bundled', { time })
  }
}
