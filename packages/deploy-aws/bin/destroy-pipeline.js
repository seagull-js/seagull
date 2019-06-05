#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = error => console.log('error', error) && process.exit(1)
const {
  SeagullPipeline,
  SeagullProject,
} = require('../dist/src/templates')

const pipelineOptions = require('./_pipeline-options')
const projectOptions = require('./_project-options')

process.env.AWS_REGION = pipelineOptions.region

if (projectOptions.branch === 'master') {
  // TODO: check confirmation
  const confirmed = false
  if (!confirmed) {
    exit(1)
    return
  }
}

const project = new SeagullProject(projectOptions)
project
  .destroyProject()
  .then(() => logSuccess())
  .catch(error => logError(error))

const pipeline = new SeagullPipeline(pipelineOptions)
pipeline
  .destroyPipeline()
  .then(() => logSuccess())
  .catch(e => logError(e))
