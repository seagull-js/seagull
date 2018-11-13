import * as React from 'react'

export interface ILayoutProps {
  helmet?: import('react-helmet').HelmetData
  styles?: string
  data?: any
  children: React.ReactNode
  pageBundle?: string
}

export class Layout extends React.Component<ILayoutProps> {
  render() {
    return (
      <html prefix="og: http://ogp.me/ns#">
        <head>
          {this.props.helmet ? this.props.helmet.meta.toComponent() : ''}
          {this.props.helmet ? this.props.helmet.title.toComponent() : ''}
          {this.props.helmet ? this.props.helmet.link.toComponent() : ''}
          {this.props.styles && (
            <style id="styles-target">{this.props.styles || ''}</style>
          )}
        </head>
        <body>
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
          <script src="/vendor.js" />
          <script
            dangerouslySetInnerHTML={{ __html: this.props.pageBundle || '' }}
          />
          <script>window.Page.default.bootstrap()</script>
          {this.props.helmet ? this.props.helmet.script.toComponent() : ''}
        </body>
      </html>
    )
  }
}
