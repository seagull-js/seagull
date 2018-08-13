#! /usr/bin/env node

// imports
const path = require('path')
const AppPlan = require('../dist/src/scaffold/plans/index').AppPlan

// configuration
const srcFolder = process.cwd()
const args = process.argv.slice(2)
const fragment = path.dirname(args[0])
const name = path.basename(args[0])

// start
const plan = new AppPlan(path.join(srcFolder, fragment), name, 'static')
plan.apply()
