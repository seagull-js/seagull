#!/usr/bin/env node

require('dotenv').config()
const {
  DeployPipeline
} = require('../dist/src')

const options = {
  profile: process.env.AWS_PROFILE
}

const logSuccess = () => console.log('done')
const logError = (error) => console.log('error', error)
const diff = new DeployPipeline(process.cwd(), options)
diff.execute().then(logSuccess()).catch(error => logError(error))