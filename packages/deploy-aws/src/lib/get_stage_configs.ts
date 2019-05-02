import { StageConfigParams } from '../types'

const curlData = `-d '{ "state": "'$PIPELINE_STATE'", "target_url": "'$TARGET_URL'", "description": "'"$PIPELINE_DESC"' - Seagull Test CI", "context": "'$TEST_PIPELINE_CONTEXT'"}'`

export function getSourceConfig(params: StageConfigParams, index: number) {
  return {
    atIndex: index,
    branch: params.branch,
    oauthToken: params.ssmSecret.secret,
    owner: params.owner,
    pipeline: params.pipeline,
    repo: params.repo,
  }
}

export function getBuildConfig(params: StageConfigParams, index: number) {
  return {
    atIndex: index,
    build: getBuild(params),
    env: getEnv(params),
    install: getInstall(params),
    pipeline: params.pipeline,
    postBuild: { commands: [] },
    role: params.role,
  }
}

function getInstall(params: StageConfigParams) {
  const curlCmd = getCurlToSendTestResult(params.owner, params.repo, curlData)
  const upgradeNpm = addStateChangeToCmd('npm i -g npm')
  const runInstall = addStateChangeToCmd('npm ci')
  const commands = [curlCmd, upgradeNpm, checkState(), runInstall, checkState()]
  return { commands, finally: [curlCmd] }
}

function getBuild(params: StageConfigParams) {
  const curlCmd = getCurlToSendTestResult(params.owner, params.repo, curlData)
  const commands = [
    addStateChangeToCmd(`STAGE=${params.stage} npm run build`),
    checkState(),
    addStateChangeToCmd('npm run test'),
    checkState(),
    addStateChangeToCmd('npm run deploy'),
    checkState(),
    'export CFURL="https://$(cat /tmp/cfurl.txt;)"; export TARGET_URL=$CFURL',
    sendDeploymentInfo(params.owner, params.repo),
    addStateChangeToCmd(`npm run test:e2e`),
    checkState(),
    `export PIPELINE_STATE="success";export PIPELINE_DESC="successful";`,
  ]
  return { commands, finally: [curlCmd] }
}

function sendDeploymentInfo(owner: string, name: string) {
  const data = `-d '{ "state": "success", "target_url": "'"https://$(cat /tmp/cfurl.txt)"'", "description": "repository was successfully deployed", "context": "continuous-integration/seagull-deployment"}'`
  return getCurlToSendTestResult(owner, name, data)
}

function checkState() {
  return `if [ "$PIPELINE_STATE" = "failure" ]; then exit 1; fi`
}

function addStateChangeToCmd(cmd: string) {
  return `export PIPELINE_DESC='${cmd}'; if ${cmd}; then echo "success at ${cmd}!"; else export PIPELINE_STATE="failure"; fi`
}

function getCurlToSendTestResult(owner: string, name: string, data: string) {
  const curlDomain = 'https://api.github.com'
  const curlPath = `/repos/${owner}/${name}/statuses/$CODEBUILD_RESOLVED_SOURCE_VERSION`
  const curlParams = `?access_token=$ACCESS_TOKEN`
  const curlUrl = `"${curlDomain}${curlPath}${curlParams}"`
  const curlHeaders = `-H 'Content-Type: application/json'`
  return `curl -s -g -X POST ${curlUrl} ${curlHeaders} ${data} > /dev/null`
}

function getEnv(params: StageConfigParams) {
  const parameterStore = { ACCESS_TOKEN: params.ssmSecret.name }
  const variables = {
    BRANCH_NAME: params.branch,
    DEPLOY_MODE: params.stage,
    PIPELINE_DESC: 'Bootstraping pipeline',
    PIPELINE_STATE: 'pending',
    TARGET_URL: params.pipelineLink,
    TEST_PIPELINE_CONTEXT: 'continuous-integration/seagull',
  }
  return { 'parameter-store': parameterStore, variables }
}
