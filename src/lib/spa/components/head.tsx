import { normalize } from 'csstips'
import * as React from 'react'
import helmet from 'react-helmet'
import { getStyles } from 'typestyle'
/**
 * ## Functional Head Component
 * Used by `Document` to build the seagull index.html.
 * - Injects Helmet tags provided by `Meta` Components.
 * - Aggregates Styles from Typestyle
 * - Accepts arbitrary children tags
 */
export default ({ children }: { children? }) => {
  // Load normalize.css into typestyle styles
  normalize()
  const helmetData = helmet.rewind()
  return (
    <head>
      {helmetData.title.toComponent()}
      {helmetData.link.toComponent()}
      {helmetData.meta.toComponent()}
      {helmetData.noscript.toComponent()}
      {helmetData.script.toComponent()}
      {helmetData.style.toComponent()}
      {children}
      <style id="styles-target">{getStyles()}</style>
      <link rel="icon" href="/favicon.ico" />
    </head>
  )
}
