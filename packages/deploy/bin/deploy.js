#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = (error) => console.log('error', error)
const {
  Deploy
} = require('../dist/src/deploy')

require('dotenv').config()

const options = {
  profile: process.env.AWS_PROFILE,
  noProfileCheck: process.env.NO_PROFILE_CHECK
}
const deploy = new Deploy(process.cwd(), options)
deploy.execute()
  .then(logSuccess())
  .catch(error => logError(error))