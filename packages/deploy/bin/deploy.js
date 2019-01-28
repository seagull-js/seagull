#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = error => console.log('error', error)
const { Deploy } = require('../dist/src/deploy')

require('dotenv').config()
const seagullConfigs = require(`${this.appPath}/package.json`).seagull
const domains = seagullConfigs ? seagullConfigs.domains : undefined
const options = {
  branchName: process.env.BRANCH_NAME || 'master',
  domains: this.branchName === 'master' ? domains : undefined,
  mode: process.env.DEPLOY_MODE || 'prod',
  noProfileCheck: process.env.NO_PROFILE_CHECK || false,
  profile: process.env.AWS_PROFILE,
  region: process.env.AWS_REGION || 'eu-central-1',
}
const deploy = new Deploy(process.cwd(), options)
deploy
  .execute()
  .then(logSuccess())
  .catch(error => logError(error))
