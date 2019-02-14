#!/usr/bin/env node
require('ts-node/register')
const { e2e } = require('../dist/src/e2e')

e2e()
  .then(() => console.log('done'))
  .catch(error => console.log('error', error))
