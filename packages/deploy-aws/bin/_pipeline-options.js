require('dotenv').config()

module.exports = {
  appPath: process.cwd(),
  branch: process.env.BRANCH_NAME || 'master',
  githubToken: process.env.GITHUB_OAUTH,
  stage: process.env.DEPLOY_MODE || 'prod',
  owner: process.env.GITHUB_OWNER,
  poll: process.env.USE_POLL === 'true',
  profile: process.env.AWS_PROFILE || 'default',
  region: process.env.AWS_REGION || 'eu-central-1',
  repository: process.env.GITHUB_REPO,
  ssmParameter: process.env.GITHUB_SSM_PARAMETER,
  computeTypeSize: process.env.COMPUTE_TYPE_SIZE || 'SMALL',
  buildWorkers: parseInt(process.env.BUILD_WORKER_COUNT || "1", 10),
  excludedPages: process.env.PAGES_TO_EXCLUDE,
  vpcId: process.env.VPC_ID || null,
  subnetIds: process.env.SUBNET_IDS || null
}
