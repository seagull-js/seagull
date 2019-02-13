#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = error => console.log('error', error)
const { Deploy } = require('../dist/src/deploy')

require('dotenv').config()
const seagullConfigs = require(`${process.cwd()}/package.json`).seagull
const configuredDomains = (seagullConfigs && seagullConfigs.domains) || []
const domains = configuredDomains.length ? configuredDomains : undefined

const options = {
  branchName: process.env.BRANCH_NAME || 'master',
  domains: process.env.BRANCH_NAME === 'master' ? domains : undefined,
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
