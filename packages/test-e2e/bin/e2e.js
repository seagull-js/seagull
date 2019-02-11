#!/usr/bin/env node

const { e2e } = require('../dist/src/e2e')

const options = {}

e2e(process.cwd(), options)
  .then(() => console.log('done'))
  .catch(error => console.log('error', error))
