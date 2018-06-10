/** @module TDD */
import { configure, render, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { Atom, IAtomProps } from '../../frontend/components/atom'

configure({ adapter: new Adapter() })

/**
 * When used in combination with the mocha-typescript decorators, this class
 * can help you to test your [[Atom]] component classes. Example:
 *
 * ```typescript
 * import 'chai/register-should'
 * import { skip, slow, suite, test, timeout } from 'mocha-typescript'
 * import { AtomTest } from '@seagull/framework'
 * import YourAtom from 'path/to/your/atom'
 *
 * @suite('Unit::Atom::YourAtom')
 * class Test extends AtomTest<YourAtom> {
 *   page = YourPage
 *
 *   @test
 *   'does work'() {
 *     this.html('/some/path').should.contain('my page title')
 *   }
 * }
 * ```
 */
export abstract class AtomTest<T extends Atom<IAtomProps>> {
  /**
   * the class of the page you want to test within this suite
   */
  abstract atom: { new (props: IAtomProps): T }

  /**
   * Get an instance of the [[atom]] class, useful for testing methods and
   * properties in isolation.
   */
  instance(props: IAtomProps) {
    return new this.atom(props)
  }

  /**
   * Get the rendered HTML output of the atom.
   */
  html(props: IAtomProps) {
    return render(<this.atom {...props} />)
  }

  /**
   * This handler will be called before each test in the suite executes and will
   * reset all stores to their default state.
   */
  before() {
    require('clear-require').match(/\.tsx?/)
  }
}
