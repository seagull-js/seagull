import { render } from 'react-dom'
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
  new Tracking()
}

fetchAndMount()
