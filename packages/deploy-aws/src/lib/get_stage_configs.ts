import { Pipeline } from '@aws-cdk/aws-codepipeline'
import { Role } from '@aws-cdk/aws-iam'
import { Secret } from '@aws-cdk/cdk'

interface StageConfigParams {
  branch: string
  mode: string
  owner: string
  pipeline: Pipeline
  repositoryName: string
  role: Role
  ssmSecret: { name: string; secret: Secret }
}

export function getStageConfigs(stageConfigParams: StageConfigParams) {
  const sourceConfig = getSourceConfig(stageConfigParams, 0)
  const buildConfig = getBuildConfig(stageConfigParams, 1)
  return { buildConfig, sourceConfig }
}

function getSourceConfig(params: StageConfigParams, index: number) {
  return {
    atIndex: index,
    branch: params.branch,
    oauthToken: params.ssmSecret.secret,
    owner: params.owner,
    pipeline: params.pipeline,
    repo: params.repositoryName,
  }
}

function getBuildConfig(params: StageConfigParams, index: number) {
  return {
    atIndex: index,
    build: getBuild(params),
    env: getEnv(params),
    install: getInstall(params),
    pipeline: params.pipeline,
    postBuild: getPostBuild(params),
    role: params.role,
  }
}

function getInstall(params: StageConfigParams) {
  const { owner, repositoryName } = params
  const curlCmd = getCurlToSendTestResult(owner, repositoryName)
  const upgradeNpm = addStateChangeToCmd('npm i -g npm')
  const runInstall = addStateChangeToCmd('npm ci')
  const commands = [curlCmd, upgradeNpm, checkState(), runInstall, checkState()]
  return { commands, finally: [curlCmd] }
}

function getBuild(params: StageConfigParams) {
  const { owner, repositoryName } = params
  const curlCmd = getCurlToSendTestResult(owner, repositoryName)
  const runBuild = addStateChangeToCmd('npm run build')
  return { commands: [runBuild, checkState()], finally: [curlCmd] }
}

function getPostBuild(params: StageConfigParams) {
  const { owner, repositoryName } = params
  const runTest = addStateChangeToCmd('npm run test')
  const runDeploy = addStateChangeToCmd('npm run deploy')
  const setState = 'export PIPELINE_STATE="success"'
  const setDesc = 'export PIPELINE_DESC="finished successfully"'
  const curlCmd = getCurlToSendTestResult(owner, repositoryName)
  const setSuccess = `${setState};${setDesc};`
  const commands = [runTest, checkState(), runDeploy, checkState(), setSuccess]
  return { commands, finally: [curlCmd] }
}

function checkState() {
  return `if [ "$PIPELINE_STATE" = "failure" ]; then exit 1337; fi`
}

function addStateChangeToCmd(cmd: string) {
  return `export PIPELINE_DESC='${cmd}'; if ${cmd}; then echo "success at ${cmd}!"; else export PIPELINE_STATE="failure"; fi`
}

function getCurlToSendTestResult(owner: string, name: string) {
  const curlDomain = 'https://api.github.com'
  const curlPath = `/repos/${owner}/${name}/statuses/$CODEBUILD_RESOLVED_SOURCE_VERSION`
  const curlParams = `?access_token=$ACCESS_TOKEN`
  const curlUrl = `"${curlDomain}${curlPath}${curlParams}"`
  const curlHeaders = `-H 'Content-Type: application/json'`
  const curlData = `-d '{ "state": "'$PIPELINE_STATE'", "target_url": "'$TEST_PIPELINE_LINK'", "description": "'"$PIPELINE_DESC"' - Seagull Test CI", "context": "continuous-integration/seagull"}'`
  return `curl -g -X POST ${curlUrl} ${curlHeaders} ${curlData}`
}

function getEnv(params: StageConfigParams) {
  const domain = 'https://eu-central-1.console.aws.amazon.com'
  const path = `/codesuite/codepipeline/pipelines/${params.pipeline.id}/view`
  const pipelineLink = `${domain}${path}`
  const parameterStore = { ACCESS_TOKEN: params.ssmSecret.name }
  const variables = {
    BRANCH_NAME: params.branch,
    DEPLOY_MODE: params.mode,
    PIPELINE_DESC: 'Bootstraping pipeline',
    PIPELINE_STATE: 'pending',
    TEST_PIPELINE_LINK: pipelineLink,
  }
  return { 'parameter-store': parameterStore, variables }
}
