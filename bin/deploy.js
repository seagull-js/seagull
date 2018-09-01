#! /usr/bin/env node

// imports
const Deploy = require('../dist/src/deploy').Folder
const process = require('process')

// configuration
const srcFolder = process.cwd()
// TODO: get port from argv

// start
new Deploy(srcFolder).run()
