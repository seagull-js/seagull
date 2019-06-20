import * as browserify from 'browserify'
import { TransformFunction } from 'through2'
import * as through from 'through2'

export const addPageRenderExport = (bfy: browserify.BrowserifyObject) => {
  bfy.transform(entryPageTransformify)
}

const exportSourceCode = `
module.exports.__renderPage = (browserBundle, data) =>
  require("@seagull/pages").render(browserBundle, exports.default, data)
`

const entryPageTransformify = (file: string, opts: browserify.Options) => {
  const isEntry = file === ((opts._flags.entries as any)[0] as string)
  return isEntry ? through(pageRenderExportTransform) : through.obj()
}

const pageRenderExportTransform: TransformFunction = function(buf, _, cb) {
  const bufString = buf.toString('utf8')
  const modifiedString = [bufString, exportSourceCode].join('\n')
  this.push(modifiedString)
  cb()
}
