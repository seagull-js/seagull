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
  const sourceAction = stack.addSourceStage(
    'source',
    getSourceConfig(params, 0)
  )
  stack.addBuildActionStage(
    'test',
    getTestConfig(params, 1, sourceAction.outputArtifact)
  )
  const buildAction = stack.addBuildActionStage('build', {
    ...getBuildConfig(params, 2, sourceAction.outputArtifact),
    outputArtifacts: buildActionOutputArtifacts,
  })
  const deployAction = stack.addBuildActionStage('deploy', {
    ...getDeployConfig(params, 3, sourceAction.outputArtifact),
    additionalInputArtifacts: [buildAction.additionalOutputArtifact('dist')],
    outputArtifacts: deployActionOutputArtifacts,
  })
  stack.addBuildActionStage('end2end-test', {
    ...getTestEnd2EndConfig(params, 4, sourceAction.outputArtifact),
    additionalInputArtifacts: [deployAction.additionalOutputArtifact('cfurl')],
  })
}
