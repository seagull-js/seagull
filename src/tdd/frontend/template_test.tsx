import 'chai/register-should'
import { configure, render, shallow } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import * as React from 'react'
import { Template } from '../../frontend'

configure({ adapter: new Adapter() })

/**
 * When used in combination with the mocha-typescript decorators, this class
 * can help you to test your [[Template]] component classes. Example:
 *
 * ```typescript
 * import 'chai/register-should'
 * import { skip, slow, suite, test, timeout } from 'mocha-typescript'
 * import { TemplateTest } from '@seagull/framework'
 * import YourTemplate from 'path/to/your/Template'
 *
 * @suite('Unit::Template::YourTemplate')
 * class Test extends TemplateTest<YourTemplate> {
 *   page = YourPage
 *
 *   @test
 *   'does work'() {
 *     this.html('/some/path').should.contain('my page title')
 *   }
 * }
 * ```
 */
export abstract class TemplateTest<T extends Template> {
  /**
   * the class of the page you want to test within this suite
   */
  abstract template: { new (props: any): T }

  /**
   * Get an instance of the [[Template]] class, useful for testing methods and
   * properties in isolation.
   */
  instance(props: any) {
    return new this.template(props)
  }

  /**
   * Get the rendered HTML output of the Template.
   */
  html(props: any) {
    return render(<this.template {...props} />)
  }

  /**
   * This handler will be called before each test in the suite executes and will
   * reset all stores to their default state.
   */
  before() {
    require('clear-require').match(/\.tsx?/)
  }
}
