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

const sourceOutput = new Artifact('source')
const testOutput = new Artifact('test')
const buildOutput = new Artifact('build')
const deployOutput = new Artifact('deploy')
const e2eOutput = new Artifact('end2end-test')
const distOutput = ArtifactPath.artifactPath('dist', 'dist/**/*').artifact
const cfURLArtifact = ArtifactPath.artifactPath('cfurl', '/tmp/cfurl.txt').artifact

export function addPipelineStages(
  stack: SeagullStack,
  params: StageConfigParams
) {
  const sourceAction = stack.addSourceStage(
    'source',
    getSourceConfig(params, sourceOutput),
  )
  const testAction = stack.addBuildActionStage(
    'test',
    getTestConfig({ params, placement: { justAfter: sourceAction }, inputArtifact: sourceOutput, outputArtifact: testOutput })
  )
  const buildAction = stack.addBuildActionStage('build', {
    ...getBuildConfig({ params, placement: { justAfter: testAction }, inputArtifact: sourceOutput, outputArtifact: buildOutput, extraOutputArtifacts: [distOutput] }),
    outputArtifacts: buildActionOutputArtifacts,
  })
  const deployAction = stack.addBuildActionStage('deploy', {
    ...getDeployConfig({ params, placement: { justAfter: buildAction }, inputArtifact: sourceOutput, outputArtifact: deployOutput, extraOutputArtifacts: [cfURLArtifact] }),
    additionalInputArtifacts: [distOutput],
    outputArtifacts: deployActionOutputArtifacts,
  })
  stack.addBuildActionStage('end2end-test', {
    ...getTestEnd2EndConfig({ params, placement: { justAfter: deployAction }, inputArtifact: sourceOutput, outputArtifact: e2eOutput }),
    additionalInputArtifacts: [cfURLArtifact],
  })
}
