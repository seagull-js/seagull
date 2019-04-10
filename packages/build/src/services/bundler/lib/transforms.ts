import * as browserify from 'browserify'
import * as envify from 'envify'
import * as uglifyify from 'uglifyify'

export const addBabelTransform = (bfy: browserify.BrowserifyObject) => {
  const browsers = ['last 2 versions', 'safari >= 7', 'ie >= 11']
  const presetEnvOptions = {
    corejs: 2,
    targets: { browsers },
    useBuiltIns: 'usage',
  }
  const presets = [['@babel/preset-env', presetEnvOptions]]
  const ignore = [/[\/\\]core-js/, /@babel[\/\\]runtime/]
  const babelifyOptions = { global: true, ignore, presets }
  bfy.transform('babelify', babelifyOptions)
}

export const addEnvify = (bfy: browserify.BrowserifyObject) => {
  const opts = { global: true }
  bfy.transform('envify', opts)
}
export const addUglifyify = (bfy: browserify.BrowserifyObject) => {
  const opts = { global: true }
  bfy.transform('uglifyify', opts)
}
