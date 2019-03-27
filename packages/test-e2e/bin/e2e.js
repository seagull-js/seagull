#!/usr/bin/env node

require('ts-node/register')
const {
  e2e
} = require('../dist/src/e2e')

const logSuccess = () => console.log('done')
const logError = (error) => console.log('error', error) && process.exit(1)

e2e().then(() => logSuccess()).catch(error => logError(error))