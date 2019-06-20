import * as browserify from 'browserify'
import * as uglifyify from 'uglifyify'

export const addUglifyify = (bfy: browserify.BrowserifyObject) => {
  const opts = { global: true }
  bfy.transform(uglifyify, opts)
}
