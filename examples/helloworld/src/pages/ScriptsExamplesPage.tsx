import { addToBodyTray, Page } from '@seagull/pages'
import * as React from 'react'
import { Helmet } from 'react-helmet'

addToBodyTray(
  'bodyBegin',
  <>
    <noscript>test</noscript>
    <script>alert(1)</script>
  </>,
  0
)

addToBodyTray(
  'bodyBegin',
  <>
    <noscript>test</noscript>
    <script>alert(1)</script>
  </>,
  0
)

addToBodyTray('bodyEnd', <script>alert(2)</script>, 0)
export default class ScriptsExamplesPage extends Page {
  html() {
    // tslint:disable-next-line:no-console
    console.log('rendering on client:', typeof window !== 'undefined')
    return (
      <div className="replaceme">
        <Helmet>
          <script src="/foo.js" defer />
          <script src="/bar.js" defer />
        </Helmet>
      </div>
    )
  }
}
