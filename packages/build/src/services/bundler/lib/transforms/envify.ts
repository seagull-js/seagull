import * as browserify from 'browserify'
import * as envify from 'envify'

export const addEnvify = (bfy: browserify.BrowserifyObject) => {
  const opts = { global: true }
  bfy.transform(envify, opts)
}
