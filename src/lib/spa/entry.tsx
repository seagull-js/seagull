import { render } from 'react-dom'
import {setStylesTarget} from 'typestyle'

import Routing from './routing'
import Tracking from './tracking'

// client side (browser) entry for loading our seagull app
async function fetchAndMount() {
  const appRouter = new Routing()
  const page = appRouter.initialMatchedPage()
  if (page && typeof page.componentDidMount === 'function') {
    await page.componentDidMount()
  }
  render(appRouter.load(), document.getElementById('root'))
  setStylesTarget(document.getElementById('styles-target'))
  // tslint:disable-next-line:no-unused-expression
  new Tracking()
}

fetchAndMount()