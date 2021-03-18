require('dotenv').config()

module.exports = {
  accountId: process.env.AWS_ACCOUNT_ID,
  appPath: process.cwd(),
  branch: process.env.BRANCH_NAME || 'master',
  profile: process.env.AWS_PROFILE || 'default',
  region: process.env.AWS_REGION || 'eu-central-1',
  stage: process.env.DEPLOY_MODE || 'prod',
  vpcId: process.env.VPC_ID || null,
  subnetIds: process.env.SUBNET_IDS || null
}
