#! /usr/bin/env node

// imports
const deploy = require('../dist/src/deploy').strategy
const process = require('process')

// configuration
const srcFolder = process.cwd()
const args = process.argv.slice(2)
const strategyName = args[0] || 'folder'

// start
deploy(srcFolder, strategyName)
