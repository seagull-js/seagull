import { listPages } from '../lib/project'
import * as E from '../services2'
import { PageBundleService as PageService } from '../services2'
import { Operator, Wiring } from './operator'

export class PageOperator extends Operator {
  static StartEvent = Symbol('Page Operator start Event')
  pages: PageService[] = []
  bundled = new Set<string>()

  constructor(parent: Operator) {
    super(parent)
    this.parent!.on(PageOperator.StartEvent, this.bundleAll)
    this.on(E.BundledPageEvent, this.handleBundled)
  }

  bundleAll = () => listPages(process.cwd()).map(this.handleBundleRequested)
  addPage = (page: string) => this.pages.push(new PageService(this, { page }))

  handleBundleRequested = (page: string) =>
    this.addPage(page) && this.emit(E.BundlePageEvent, page)

  handleBundled = (page: string) =>
    this.bundled.add(page) &&
    this.bundled.size === this.pages.length &&
    this.parent!.emit(PageOperator.DoneEvent)
}
