#!/usr/bin/env node

require('ts-node/register')
const {
  e2e
} = require('../dist/src/e2e')

const logResult = (result) => result === false && process.exit(1)

const logError = (error) => console.log('error', error) && process.exit(1)

e2e().then((result) => logResult(result)).catch(error => logError(error))