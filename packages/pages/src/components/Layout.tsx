import * as _ from 'lodash'
import * as React from 'react'
import { HelmetData } from '../helmet'

export interface ILayoutProps {
  helmet?: HelmetData
  data?: any
  children: React.ReactNode
  pageBundle?: string
  styles?: string
  noscript?: string
}

export class Layout extends React.Component<ILayoutProps> {
  get head() {
    const helmet = this.props.helmet
    const styles = this.props.styles || ''
    return (
      <head>
        {helmet ? helmet.meta.toComponent() : ''}
        {helmet ? helmet.title.toComponent() : ''}
        {helmet ? helmet.link.toComponent() : ''}
        {helmet ? helmet.style.toComponent() : ''}
        {styles && <style id="styles-target">{styles}</style>}
        {helmet ? helmet.script.toComponent() : ''}
      </head>
    )
  }
  noScript = (
    <noscript dangerouslySetInnerHTML={{ __html: this.props.noscript || '' }} />
  )
  initialState = this.props.data && (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__initial_state__ = ${JSON.stringify(this.props.data)}`,
      }}
    />
  )
  pageBundle = (
    <script dangerouslySetInnerHTML={{ __html: this.props.pageBundle || '' }} />
  )
  render() {
    return (
      <html prefix="og: http://ogp.me/ns#">
        {this.head}
        <body>
          {this.noScript}
          <div id="app">{this.props.children}</div>
          {this.initialState}
          <script src="/vendor.js" data-no-instant />
          {this.pageBundle}
          <script>window.Page.default.bootstrap()</script>
        </body>
      </html>
    )
  }
}
