import { listPages } from '../lib/project'
import * as E from '../services'
import { LogEvent, PageBundleService as PageService } from '../services'
import { Operator, Wiring } from './operator'

export class PageOperator extends Operator {
  static StartEvent = Symbol('Page Operator start Event')
  pages: PageService[] = []
  bundled = new Set<string>()
  bundleTimer?: [number, number]

  constructor(parent: Operator) {
    super(parent)
    this.parent!.on(PageOperator.StartEvent, this.bundleAll)
    this.on(E.BundledPageEvent, this.handleBundled)
    this.on(E.LogEvent, (this.parent as any).emit.bind(this.parent, LogEvent))
  }

  bundleAll = () => {
    this.bundleTimer = process.hrtime()
    listPages(process.cwd()).map(this.handleBundleRequested)
  }
  addPage = (page: string) => this.pages.push(new PageService(this, { page }))

  handleBundleRequested = (page: string) =>
    this.addPage(page) && this.emit(E.BundlePageEvent, page)

  handleBundled = (page: string) => {
    this.bundled.add(page)
    if (this.bundled.size !== this.pages.length) {
      return
    }
    this.parent!.emit(PageOperator.DoneEvent)
    const time = process.hrtime(this.bundleTimer)
    this.parent!.emit(LogEvent, 'PageOperator', 'Bundled', { time })
  }
}
