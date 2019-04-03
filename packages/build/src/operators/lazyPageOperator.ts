import * as E from '../services'
import { PageBundleService as PageService } from '../services'
import { Operator, Wiring } from './operator'

export class LazyPageOperator extends Operator {
  pages: PageService[] = []
  wiring: Wiring[] = [
    { on: [this.parent!, E.PageBundleRequested], emit: E.PageBundleRequested },
    { on: E.BundledPageEvent, emit: [this.parent!, E.BundledPageEvent] },
    { on: E.LogEvent, emit: [this.parent!, E.LogEvent] },
  ]

  constructor(parent: Operator) {
    super(parent)
    this.setupWiring()
    this.on(E.PageBundleRequested, this.handleBundleRequested)
  }

  handleBundleRequested = (page: string) => {
    // tslint:disable-next-line:no-unused-expression
    !this.hasPage(page) && this.addPage(page)
    this.emit(E.BundlePageEvent, page)
  }

  hasPage = (page: string) => this.pages.find(s => s.config.page === page)
  addPage = (page: string) => this.pages.push(new PageService(this, { page }))
}
