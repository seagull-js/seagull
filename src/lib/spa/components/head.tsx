import * as React from 'react'
import helmet from 'react-helmet'
import { getStyles } from 'typestyle'

export default ({ children }: { children? }) => {
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
