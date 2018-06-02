/** @module Frontend */
import * as React from 'react'

/**
 * The [[Layout]] component is flexible enough out-of-the-box to handle stuff
 * that shall go into the HTML `<head />` and some script/state bootstrapping.
 */
export interface ILayoutProps {
  /** if helmet is used and a first rendering was executed, pass in the result */
  helmet?: import('react-helmet').HelmetData
  styles?: string
  states?: any
  children: React.ReactNode
}

/**
 * Default component to render the app, way more flexible than just using some
 * 'index.html' file and doing some search and replace in the HTML string.
 * Can be used standalone or with proper support for `typestyle`, `helmet` and
 * state hydration through [[ILayoutProps]], which are typically passed in
 * during the second server side rendering call.
 */
export const Layout = (props: ILayoutProps) => (
  <html prefix="og: http://ogp.me/ns#">
    <head>
      {props.helmet ? props.helmet.meta.toComponent() : ''}
      {props.helmet ? props.helmet.title.toComponent() : ''}
      {props.helmet ? props.helmet.link.toComponent() : ''}
      {props.styles && <style id="styles-target">{props.styles || ''}</style>}
    </head>
    <body>
      <div id="app">{props.children}</div>

      {props.states && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__initial_state__ = ${JSON.stringify(
              props.states
            )}`,
          }}
        />
      )}
      <script src="/dist/assets/bundle.js" />
      <script>window.app.mount()</script>
    </body>
  </html>
)
