import { Organism } from '@components/organism'
import { OrganismTest } from '@tdd/frontend'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'
import * as React from 'react'

class Button extends Organism<{ label: string; handler: () => string }> {
  render() {
    return (
      <button onClick={() => this.props.handler}>{this.props.label}</button>
    )
  }
}

@suite('Unit::Frontend::Components::Organism')
export class Test extends OrganismTest<Button> {
  organism = Button

  @test
  async 'can be instantiated with props'() {
    const instance = this.instance({ label: 'label', handler: () => 'click!' })
    instance.should.be.an('object')
  }

  @test
  async 'can be rendered to correct HTML'() {
    const html = this.html({ label: 'label', handler: () => 'click!' })
    html.text().should.be.equal('label')
  }

  @test.skip
  async 'can be clicked'() {
    // no idea currently how to test this
  }
}
