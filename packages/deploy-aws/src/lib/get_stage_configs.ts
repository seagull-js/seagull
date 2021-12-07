import { Artifact } from '@aws-cdk/aws-codepipeline-api'
import { StageConfigParams } from '../types'

const curlData = `-d '{ "state": "'$PIPELINE_STATE'", "target_url": "'$TARGET_URL'", "description": "'"$PIPELINE_DESC"' - Seagull Test CI", "context": "'$TEST_PIPELINE_CONTEXT'"}'`

export function getSourceConfig(params: StageConfigParams, index: number) {
  return {
    atIndex: index,
    branch: params.branch,
    oauthToken: params.ssmSecret.secret,
    owner: params.owner,
    pipeline: params.pipeline,
    poll: params.poll,
    repo: params.repo,
  }
}

export function getBuildConfig(
  params: StageConfigParams,
  index: number,
  inputArtifact?: Artifact
) {
  return {
    ...getCommonConfig(params, index, inputArtifact),
    build: getBuild(params),
  }
}

export function getTestConfig(
  params: StageConfigParams,
  index: number,
  inputArtifact?: Artifact
) {
  return {
    ...getCommonConfig(params, index, inputArtifact),
    postBuild: getTest(params),
  }
}

export function getTestEnd2EndConfig(
  params: StageConfigParams,
  index: number,
  inputArtifact?: Artifact
) {
  return {
    ...getCommonConfig(params, index, inputArtifact),
    postBuild: getTestEnd2End(params),
  }
}

export function getDeployConfig(
  params: StageConfigParams,
  index: number,
  inputArtifact?: Artifact
) {
  return {
    ...getCommonConfig(params, index, inputArtifact),
    // build: getBuild(params),
    postBuild: getDeploy(params),
  }
}

function getCommonConfig(
  params: StageConfigParams,
  index: number,
  inputArtifact?: Artifact
) {
  return {
    atIndex: index,
    build: { commands: [], finally: [] },
    computeTypeSize: params.computeTypeSize,
    env: getEnv(params),
    inputArtifact,
    install: getInstall(params),
    pipeline: params.pipeline,
    postBuild: { commands: [] },
    role: params.role,
  }
}

function getInstall(params: StageConfigParams) {
  const curlCmd = getCurlToSendTestResult(params.owner, params.repo, curlData)
  const upgradeNpm = addStateChangeToCmd('npm i -g npm@7.7.6')
  const runInstall = addStateChangeToCmd('npm ci')
  const commands = [curlCmd, upgradeNpm, checkState(), runInstall, checkState()]
  return getCommandConfig(params, commands)
}

function getBuild(params: StageConfigParams) {
  // Fixes an issue where the max file watch count is exceeded, triggering ENOSPC
  // https://stackoverflow.com/questions/22475849/node-js-error-enospc#32600959
  const incFileWatcherLimit = addStateChangeToCmd(
    `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`
  )
  const runBuild = addStateChangeToCmd('npm run build')
  return getCommandConfig(params, [incFileWatcherLimit, runBuild, checkState()])
}

function getTest(params: StageConfigParams) {
  const runTest = addStateChangeToCmd('npm run test')
  return getCommandConfig(params, [runTest, checkState()])
}

function getTestEnd2End(params: StageConfigParams) {
  const commands = [
    'export CFURL="https://$(cat $CODEBUILD_SRC_DIR_cfurl/tmp/cfurl.txt;)"; export TARGET_URL=$CFURL',
    'echo "Cloudfront URL: $CFURL"',
    addStateChangeToCmd(`npm run test:e2e`),
    checkState(),
    `export PIPELINE_STATE="success";export PIPELINE_DESC="successful";`,
  ]
  return getCommandConfig(params, commands)
}

function getDeploy(params: StageConfigParams) {
  const mergeCommands = [...Array(params.buildWorkers).keys()].map(i =>
    addStateChangeToCmd(`cp -Rf  $CODEBUILD_SRC_DIR_dist${i}/dist/* dist`)
  )
  const commands = [
    addStateChangeToCmd('mkdir dist'),
    ...mergeCommands,
    checkState(),
    addStateChangeToCmd('npm run deploy'),
    checkState(),
    sendDeploymentInfo(params.owner, params.repo),
  ]
  return getCommandConfig(params, commands)
}

function getCommandConfig(params: StageConfigParams, commands: string[]) {
  const curlCmd = getCurlToSendTestResult(params.owner, params.repo, curlData)
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
    COMPUTE_TYPE_SIZE: params.computeTypeSize,
    DEPLOY_MODE: params.stage,
    PIPELINE_DESC: 'Bootstraping pipeline',
    PIPELINE_STATE: 'pending',
    STAGE: params.stage,
    TARGET_URL: params.pipelineLink,
    TEST_PIPELINE_CONTEXT: 'continuous-integration/seagull',
    VPC_ID: params.vpcId,
    SUBNET_IDS: params.subnetIds,
    ...(params.excludedPages ? { PAGES_TO_EXCLUDE: params.excludedPages } : {}),
  }
  return { 'parameter-store': parameterStore, variables }
}
