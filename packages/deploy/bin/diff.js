#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = (error) => console.log('error', error)
const {
  Diff
} = require('../dist/src')


require('dotenv').config()

const options = {
  profile: process.env.AWS_PROFILE
}
const diff = new Diff(process.cwd(), options)
diff.execute()
  .then(logSuccess())
  .catch(error => logError(error))