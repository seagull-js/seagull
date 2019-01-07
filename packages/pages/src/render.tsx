import * as React from 'react'
import { renderToString } from 'react-dom/server'
import { Layout } from './components/Layout'
import { PageType } from './Page'

export function render(pageBlob: string, Page: PageType, data: any) {
  renderToString(
    <Layout data={data}>
      <Page data={data} />
    </Layout>
  )
  const helmet = (Page as any).helmetInstance().renderStatic()
  return (
    '<!DOCTYPE html>\n' +
    renderToString(
      <Layout helmet={helmet} data={data} pageBundle={pageBlob}>
        <Page data={data} />
      </Layout>
    )
  )
}
