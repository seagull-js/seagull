import * as browserify from 'browserify'

export const addBabelTransform = (bfy: browserify.BrowserifyObject) => {
  const browsers = ['last 2 versions', 'safari >= 7', 'ie >= 11']
  const presetEnvOptions = { targets: { browsers }, useBuiltIns: 'usage' }
  const presets = [['@babel/preset-env', presetEnvOptions]]
  const ignore = [/[\/\\]core-js/, /@babel[\/\\]runtime/]
  const babelifyOptions = { global: true, ignore, presets }
  bfy.transform('babelify', babelifyOptions)
}
