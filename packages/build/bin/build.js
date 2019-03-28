#!/usr/bin/env node

const {
  build
} = require('../dist/src/build')
const logSuccess = () => console.log('done')
const logError = (error) => console.log('error', error) && process.exit(1)

const appPath = process.cwd()
const opts = {
  vendor: ['react', 'react-dom', 'react-helmet', 'lodash', 'typestyle'],
}
build(appPath, opts).then(() => logSuccess()).catch(error => logError(error))