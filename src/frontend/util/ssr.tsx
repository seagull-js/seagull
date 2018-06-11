import * as React from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import { getStyles } from 'typestyle'
import { App, Layout, Registry } from '../'

export async function ssr(app: App, url: string, prerender: boolean = false) {
  // Store.Root.reset()
  const render = prerender ? renderToStaticMarkup : renderToString
  const component = await app.match(url)
  render(<Layout>{component}</Layout>)
  const helmet = Helmet.renderStatic()
  const styles = getStyles()
  const states = Registry.collectStates()
  const html = render(
    <Layout helmet={helmet} states={states} styles={styles}>
      {component}
    </Layout>
  )
  return html
}
