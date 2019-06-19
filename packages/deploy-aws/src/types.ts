import { RestApi } from '@aws-cdk/aws-apigateway'
import * as CF from '@aws-cdk/aws-cloudfront'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import { Artifact, StagePlacement } from '@aws-cdk/aws-codepipeline'
import * as IAM from '@aws-cdk/aws-iam'
import { Bucket } from '@aws-cdk/aws-s3'
import { SecretValue, StackProps } from '@aws-cdk/cdk'
import { SSMHandler } from './aws_sdk_handler'

export type Keymap = { [key: string]: string }

export interface TokenParams {
  ssmHandler: SSMHandler
  tokenName?: string
  token?: string
}

export interface SchemaArn {
  acmCertRef: string
  names: string[]
}

export interface GitDataProps {
  branch: string
  owner?: string
  pkg?: any
  repo?: string
}

export interface RepoData {
  branch: string
  owner: string
  repo: string
}

export interface StageConfigParams {
  branch: string
  owner: string
  pipeline: Pipeline
  pipelineLink: string
  repo: string
  role: IAM.Role
  ssmSecret: { name: string; secret: SecretValue }
  stage: string
}

export interface OperationsProps {
  projectName: string
  stackProps?: StackProps
}

export interface Rule {
  path: string
  cron: string
}

export interface StageConfig {
  placement?: StagePlacement
  pipeline: Pipeline
  output: Artifact
}

export interface BuildStageConfig extends StageConfig {
  additionalInputArtifacts?: Artifact[]
  build: { commands: string[]; finally: string[] }
  inputArtifact: Artifact
  install: { commands: string[]; finally: string[] }
  extraOutputs?: Artifact[]
  outputArtifacts?: any
  postBuild?: { commands: string[]; finally?: string[] }
  role: IAM.Role
  env: { variables: { [key: string]: string } }
}

export interface SourceStageConfig extends StageConfig {
  branch: string
  owner: string
  repo: string
  oauthToken: SecretValue
}

export interface CloudfrontProps {
  apiGateway: RestApi
  aliasConfig?: CF.AliasConfiguration
  logBucket?: Bucket
}
