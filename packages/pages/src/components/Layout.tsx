import * as _ from 'lodash'
import * as React from 'react'
import { HelmetData } from '../helmet'

export interface ILayoutProps {
  helmet?: HelmetData
  data?: any
  children: React.ReactNode
  pageBundle?: string
  styles?: string
}

export class Layout extends React.Component<ILayoutProps> {
  render() {
    const helmet = this.props.helmet
    const styles = this.props.styles || ''
    return (
      <html prefix="og: http://ogp.me/ns#">
        <head>
          {helmet ? helmet.meta.toComponent() : ''}
          {helmet ? helmet.title.toComponent() : ''}
          {helmet ? helmet.link.toComponent() : ''}
          {helmet ? helmet.style.toComponent() : ''}
          {styles && <style id="styles-target">{styles}</style>}
          {helmet ? helmet.script.toComponent() : ''}
        </head>
        <body>
          <noscript title="noscript-the-one-and-only" />
          <div id="app">{this.props.children}</div>
          {this.props.data && (
            <script
              dangerouslySetInnerHTML={{
                __html: `window.__initial_state__ = ${JSON.stringify(
                  this.props.data
                )}`,
              }}
            />
          )}
          <script src="/vendor.js" data-no-instant />
          <script
            dangerouslySetInnerHTML={{ __html: this.props.pageBundle || '' }}
          />
          <script>window.Page.default.bootstrap()</script>
        </body>
      </html>
    )
  }
}
