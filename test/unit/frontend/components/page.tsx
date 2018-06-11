import { Page } from '@components/page'
import { PageTest } from '@tdd/frontend/page_test'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import * as React from 'react'

class DemoPage extends Page {
  path = '/demo'
  title = 'Demo'
  description = () => `demo: ${this.props.params.name}`
  html() {
    return <div>demo</div>
  }
}

@suite('Unit::Frontend::Page')
class Test extends PageTest<DemoPage> {
  page = DemoPage

  @test
  async 'can be instantiated with props'() {
    const instance = this.instance('/demo', {}, '/')
    instance.should.be.an('object')
    instance.path.should.be.equal('/demo')
  }

  @test
  async 'can be rendered through react'() {
    const html = await this.html('/demo')
    html.should.contain('<div>demo</div>')
  }

  @test
  async 'has correct metadata'() {
    const html = await this.html('/demo?name=anonyfox')
    html.should.contain('<title data-react-helmet="true">Demo</title>')
    html.should.contain('name="og:type" content="website"')
    html.should.contain('name="twitter:card" content="summary"')
    html.should.contain('name="og:title" content="Demo"')
    html.should.contain('name="twitter:title" content="Demo"')
    html.should.contain('name="og:description" content="demo: anonyfox"')
    html.should.contain('name="twitter:description" content="demo: anonyfox"')
    html.should.contain('name="og:image" content=""')
    html.should.contain('name="twitter:image" content=""')
    html.should.contain('name="og:url" content="/demo"')
    html.should.contain('name="twitter:url" content="/demo"')
    html.should.contain('rel="canonical" href="/demo"')
  }
}
