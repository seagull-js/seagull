import { Artifact, ArtifactPath } from '@aws-cdk/aws-codepipeline';
import { SeagullStack } from '../seagull_stack'
import { StageConfigParams } from '../types'
import {
  getBuildConfig,
  getDeployConfig,
  getSourceConfig,
  getTestConfig,
  getTestEnd2EndConfig,
} from './get_stage_configs'

const buildActionOutputArtifacts = {
  'secondary-artifacts': {
    build: {
      files: '**/*',
      name: 'build',
    },
    dist: {
      files: ['dist/**/*'],
      name: 'dist',
    },
  },
}

const deployActionOutputArtifacts = {
  'secondary-artifacts': {
    cfurl: {
      files: ['/tmp/cfurl.txt'],
      name: 'cfurl',
    },
    deploy: {
      files: '**/*',
      name: 'deploy',
    },
  },
}

export function addPipelineStages(
  stack: SeagullStack,
  params: StageConfigParams
) {
  const sourceOutput = new Artifact('source')
  const sourceAction = stack.addSourceStage(
    'source',
    getSourceConfig(params, sourceOutput),
  )
  const testOutput = new Artifact('test')
  const testAction = stack.addBuildActionStage(
    'test',
    getTestConfig(params, { justAfter: sourceAction }, sourceOutput, testOutput)
  )
  const buildOutput = new Artifact('build')
  const distOutput = ArtifactPath.artifactPath('dist', 'dist/**/*').artifact
  const buildAction = stack.addBuildActionStage('build', {
    ...getBuildConfig(params, { justAfter: testAction }, sourceOutput, buildOutput, [distOutput]),
    outputArtifacts: buildActionOutputArtifacts,
  })
  const deployOutput = new Artifact('deploy')
  const cfURLArtifact = ArtifactPath.artifactPath('cfurl', '/tmp/cfurl.txt').artifact
  const deployAction = stack.addBuildActionStage('deploy', {
    ...getDeployConfig(params, { justAfter: buildAction }, sourceOutput, deployOutput, [cfURLArtifact]),
    additionalInputArtifacts: [distOutput],
    outputArtifacts: deployActionOutputArtifacts,
  })
  const e2eOutput = new Artifact('end2end-test')
  stack.addBuildActionStage('end2end-test', {
    ...getTestEnd2EndConfig(params, { justAfter: deployAction }, sourceOutput, e2eOutput),
    additionalInputArtifacts: [cfURLArtifact],
  })
}
