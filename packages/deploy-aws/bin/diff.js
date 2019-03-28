#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = (error) => console.log('error', error) && process.exit(1)
const {
  SeagullProject
} = require('../dist/src/templates/seagull_project')

require('dotenv').config()

const options = {
  accountId: process.env.AWS_ACCOUNT_ID,
  appPath: process.cwd(),
  branch: process.env.BRANCH_NAME || 'master',
  mode: process.env.DEPLOY_MODE || 'prod',
  profile: process.env.AWS_PROFILE || 'default',
  region: process.env.AWS_REGION || 'eu-central-1'
}
const project = new SeagullProject(options)
project.diffProject().then(() => logSuccess()).catch(error => logError(error))