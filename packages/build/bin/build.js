#!/usr/bin/env node

const { build } = require('../dist/src/build')

const options = {
  vendor: ['react', 'react-dom', 'react-helmet', 'lodash', 'typestyle'],
}

build(process.cwd(), options)
