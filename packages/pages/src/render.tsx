import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { getStyles } from 'typestyle'
import { Layout } from './components/Layout'
import { PageType } from './Page'

export function render(pageBlob: string, Page: PageType, data: any) {
  renderToString(
    <Layout data={data}>
      <Page data={data} />
    </Layout>
  )
  const helmet = (Page as any).helmetInstance().renderStatic()
  const styles = getStyles()
  return (
    '<!DOCTYPE html>\n' +
    renderToString(
      <Layout helmet={helmet} data={data} styles={styles} pageBundle={pageBlob}>
        <Page data={data} />
      </Layout>
    )
  )
}
