#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = error => console.log('error', error) && process.exit(1)
const { SeagullProject } = require('../dist/src/templates/seagull_project')

const options = require('./_project-options')

process.env.AWS_REGION = options.region

const project = new SeagullProject(options)
project
  .deployProject()
  .then(() => logSuccess())
  .catch(error => logError(error))
