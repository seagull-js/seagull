import { RestApi } from '@aws-cdk/aws-apigateway'
import * as CF from '@aws-cdk/aws-cloudfront'
import { Pipeline } from '@aws-cdk/aws-codepipeline'
import * as IAM from '@aws-cdk/aws-iam'
import { Bucket } from '@aws-cdk/aws-s3'
import { Secret, StackProps } from '@aws-cdk/cdk'
import { SSMHandler } from './aws_sdk_handler'
import { Artifact } from '@aws-cdk/aws-codepipeline-api'

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
  ssmSecret: { name: string; secret: Secret }
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
  atIndex: number
  pipeline: Pipeline
  inputArtifact?: Artifact
}

export interface BuildStageConfig extends StageConfig {
  additionalInputArtifacts?: Artifact[]
  build: { commands: string[]; finally: string[] }
  install: { commands: string[]; finally: string[] }
  postBuild?: { commands: string[]; finally?: string[] }
  role: IAM.Role
  env: { variables: { [key: string]: string } }
}

export interface SourceStageConfig extends StageConfig {
  branch: string
  owner: string
  repo: string
  oauthToken: Secret
}

export interface CloudfrontProps {
  apiGateway: RestApi
  aliasConfig?: CF.AliasConfiguration
  logBucket?: Bucket
}
