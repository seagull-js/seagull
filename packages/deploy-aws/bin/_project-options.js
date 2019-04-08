require('dotenv').config()

module.exports = {
  accountId: process.env.AWS_ACCOUNT_ID,
  appPath: process.cwd(),
  branch: process.env.BRANCH_NAME || 'master',
  mode: process.env.DEPLOY_MODE || 'prod',
  profile: process.env.AWS_PROFILE || 'default',
  region: process.env.AWS_REGION || 'eu-central-1',
}
