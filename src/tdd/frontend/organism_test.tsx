import 'chai/register-should'
import { configure, render, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { Organism } from '../../frontend'

configure({ adapter: new Adapter() })

/**
 * When used in combination with the mocha-typescript decorators, this class
 * can help you to test your [[Molecule]] component classes. Example:
 *
 * ```typescript
 * import 'chai/register-should'
 * import { skip, slow, suite, test, timeout } from 'mocha-typescript'
 * import { MoleculeTest } from '@seagull/framework'
 * import YourMolecule from 'path/to/your/Molecule'
 *
 * @suite('Unit::Molecule::YourMolecule')
 * class Test extends MoleculeTest<YourMolecule> {
 *   page = YourPage
 *
 *   @test
 *   'does work'() {
 *     this.html('/some/path').should.contain('my page title')
 *   }
 * }
 * ```
 */
export abstract class OrganismTest<T extends Organism> {
  /**
   * the class of the page you want to test within this suite
   */
  abstract organism: { new (props: any): T }

  /**
   * Get an instance of the [[Organism]] class, useful for testing methods and
   * properties in isolation.
   */
  instance(props: any) {
    return new this.organism(props)
  }

  /**
   * Get the rendered HTML output of the Organism.
   */
  html(props: any) {
    return render(<this.organism {...props} />)
  }

  /**
   * This handler will be called before each test in the suite executes and will
   * reset all stores to their default state.
   */
  before() {
    require('clear-require').match(/\.tsx?/)
  }
}
