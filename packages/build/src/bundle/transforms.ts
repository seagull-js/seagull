import * as browserify from 'browserify'

export const addBabelTransform = (bfy: browserify.BrowserifyObject) => {
  const browsers = ['last 2 versions', 'safari >= 7', 'ie >= 11']
  const presetEnvOptions = { targets: { browsers }, useBuiltIns: 'usage' }
  const presets = [['@babel/preset-env', presetEnvOptions]]
  const babelifyOptions = { global: true, presets }
  bfy.transform('babelify', babelifyOptions)
}
