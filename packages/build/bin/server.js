#!/usr/bin/env node

const {
  Observer
} = require('../dist/src/observer')

const logSuccess = () => console.log('done')
const logError = (error) => console.log('error', error) && process.exit(1)

const options = {
  port: process.env.PORT || 8080,
  dataPath: '.data',
  vendor: ['react', 'react-dom', 'react-helmet', 'lodash', 'typestyle'],
}

new Observer(process.cwd(), options)
  .start()
  .then(() => logSuccess())
  .catch(error => logError(error))