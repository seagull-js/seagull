import * as React from 'react'
import { renderToString } from 'react-dom/server'
import Helmet from 'react-helmet'
import { getStyles } from 'typestyle'
import { Layout } from './components/Layout'

import { PageType } from './Page'

export function render(pageBlob: string, page: PageType, data: any) {
  const body = React.createElement(page, { data })
  renderToString(<Layout data={data}>{body}</Layout>)
  const helmet = Helmet.renderStatic()
  const styles = getStyles()
  return renderToString(
    <Layout helmet={helmet} data={data} styles={styles} pageBundle={pageBlob}>
      {body}
    </Layout>
  )
}
