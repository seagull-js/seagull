#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = error => console.log('error', error) && process.exit(1)
const { SeagullProject } = require('../dist/src/templates/seagull_project')

const options = require('./_project-options')

process.env.AWS_REGION = options.region

if (options.branch === 'master') {
  // TODO: check confirmation
  const confirmed = false
  if (!confirmed) {
    exit(1)
    return
  }
}

const project = new SeagullProject(options)
project
  .destroyProject()
  .then(() => logSuccess())
  .catch(error => logError(error))
