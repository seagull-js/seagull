#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = error => console.log('error', error) && process.exit(1)
const { SeagullPipeline } = require('../dist/src/templates/seagull_pipeline')

const options = require('./_pipeline-options')

process.env.AWS_REGION = options.region

const pipeline = new SeagullPipeline(options)
pipeline
  .deployPipeline()
  .then(() => logSuccess())
  .catch(e => logError(e))
