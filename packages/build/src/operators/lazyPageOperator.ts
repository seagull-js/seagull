import * as E from '../services2'
import { PageBundleService as PageService } from '../services2'
import { Operator, Wiring } from './operator'

export class LazyPageOperator extends Operator {
  pages: PageService[] = []
  wiring: Wiring[] = [
    { on: [this.parent!, E.PageBundleRequested], emit: E.PageBundleRequested },
    { on: E.BundledPageEvent, emit: [this.parent!, E.BundledPageEvent] },
  ]

  constructor(parent: Operator) {
    super(parent)
    this.setupWiring()
    this.on(E.PageBundleRequested, this.handleBundleRequested)
  }

  handleBundleRequested = (page: string) => {
    // tslint:disable-next-line:no-unused-expression
    void (!this.hasPage(page) && this.addPage(page))
    this.emit(E.BundlePageEvent, page)
  }

  hasPage = (page: string) => this.pages.find(s => s.config.page === page)
  addPage = (page: string) => this.pages.push(new PageService(this, { page }))
}
