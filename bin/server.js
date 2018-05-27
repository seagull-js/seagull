#! /usr/bin/env node

// imports
const Watcher = require('../dist/src/tools/watcher').default
const process = require('process')

// configuration
const srcFolder = process.cwd()
    // TODO: get port from argv

// start
new Watcher(srcFolder).start()