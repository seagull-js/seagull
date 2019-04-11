import { NoScript, Page } from '@seagull/pages'
import * as React from 'react'
import { Helmet } from 'react-helmet'

class ExampleComponent extends React.Component {
  render() {
    return (
      <div>
        {/* adding google tag manager noscript */}
        <NoScript>{`<iframe src="https://www.googletagmanager.com/ns.html?id=NOT-EXISTING-123" height="0" width="0" style="display:none;visibility:hidden"></iframe>`}</NoScript>
        Adding some more noscript ...
      </div>
    )
  }
}

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
        <NoScript>Your javascript is disabled!</NoScript>
        <ExampleComponent />
        This is only visible while loading ...
      </div>
    )
  }
}
