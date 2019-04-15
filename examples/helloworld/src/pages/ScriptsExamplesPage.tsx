import { Page } from '@seagull/pages'
import * as React from 'react'
import { Helmet } from 'react-helmet'

export default class ScriptsExamplesPage extends Page {
  static noScript = 'Your javascript is disabled!'
  html() {
    // tslint:disable-next-line:no-console
    console.log('rendering on client:', typeof window !== 'undefined')
    return (
      <div className="replaceme">
        <Helmet>
          <script src="/foo.js" defer />
          <script src="/bar.js" defer />
        </Helmet>
        This is only visible while loading ...
      </div>
    )
  }
}
