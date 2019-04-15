import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Layout } from './components/Layout'
import { NoScript } from './noScript'
import { PageType } from './Page'

export function render(pageBlob: string, Page: PageType, data: any) {
  renderToString(
    <Layout data={data}>
      <Page data={data} />
    </Layout>
  )
  const helmet = (Page as any).helmetInstance().renderStatic()
  const noscript = (NoScript as any).renderStatic()
  const styles = (Page as any).getStyles()
  return (
    '<!DOCTYPE html>\n' +
    renderToString(
      <Layout
        helmet={helmet}
        data={data}
        pageBundle={pageBlob}
        styles={styles}
        noscript={noscript}
      >
        <Page data={data} />
      </Layout>
    )
  )
}
