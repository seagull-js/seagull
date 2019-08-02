import { SeagullStack } from '../seagull_stack'
import { StageConfigParams } from '../types'
import {
  getBuildConfig,
  getDeployConfig,
  getSourceConfig,
  getTestConfig,
  getTestEnd2EndConfig,
} from './get_stage_configs'

const buildActionOutputArtifacts = (workers: number) => {
  const artifacts = {} as any
  ;[...Array(workers).keys()].forEach(i => {
    const build = `build${i}`
    const dist = `dist${i}`
    artifacts[build] = { files: ['dist/**/*'], name: build }
    artifacts[dist] = { files: ['dist/**/*'], name: dist }
  })
  return {
    'primary-artifacts': {},
    'secondary-artifacts': artifacts,
  }
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

  const buildActions = stack.addBuildActionStage(
    'build',
    {
      ...getBuildConfig(params, 1, sourceAction.outputArtifact),
      outputArtifacts: buildActionOutputArtifacts(params.buildWorkers),
    },
    getTestConfig(params, 1, sourceAction.outputArtifact),
    params.buildWorkers
  )

  const deployInput = buildActions.map((a, i) =>
    a.additionalOutputArtifact(`dist${i}`)
  )

  const deployAction = stack.addDeployActionStage('deploy', {
    ...getDeployConfig(params, 2, sourceAction.outputArtifact),
    additionalInputArtifacts: deployInput,
    outputArtifacts: deployActionOutputArtifacts,
  })
  stack.addGenericBuildActionStage('end2end-test', {
    ...getTestEnd2EndConfig(params, 3, sourceAction.outputArtifact),
    additionalInputArtifacts: [deployAction.additionalOutputArtifact('cfurl')],
  })
}
