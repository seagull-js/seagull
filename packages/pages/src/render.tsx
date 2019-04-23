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
  const styles = (Page as any).getStyles()
  const bodybegin = (Page as any).getTray('bodyBegin')
  const bodyend = (Page as any).getTray('bodyEnd')
  return (
    '<!DOCTYPE html>\n' +
    renderToString(
      <Layout
        bodybegin={bodybegin}
        bodyend={bodyend}
        helmet={helmet}
        data={data}
        pageBundle={pageBlob}
        styles={styles}
      >
        <Page data={data} />
      </Layout>
    )
  )
}
