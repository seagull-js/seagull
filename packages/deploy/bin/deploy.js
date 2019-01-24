#!/usr/bin/env node

const logSuccess = () => console.log('done')
const logError = error => console.log('error', error)
const { Deploy } = require('../dist/src/deploy')

require('dotenv').config()
const acmCertRef = process.env.ACM_CERT_REF
const names = process.env.ALIAS_URLS
  ? process.env.ALIAS_URLS.split(',')
  : undefined
const aliasses = acmCertRef && names ? { acmCertRef, names } : undefined
const options = {
  aliasConfiguration: aliasses,
  branchName: process.env.BRANCH_NAME || 'master',
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
