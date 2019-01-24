import { AliasConfiguration } from '@aws-cdk/aws-cloudfront'
import { App } from '@aws-cdk/cdk'
import { AppStack } from '.'

interface ProjectProps {
  account?: string
  aliasConfiguration?: AliasConfiguration
  deployS3: boolean
  s3Name: string
  region: string
  path: string
}

export class ProjectApp extends App {
  stack: AppStack

  constructor(name: string, projectProps: ProjectProps) {
    super()
    const { account, deployS3, s3Name, region, path } = projectProps
    const { aliasConfiguration } = projectProps
    const env = { account, path, region }
    const stackProps = { aliasConfiguration, s3Name, env, deployS3 }
    // tslint:disable-next-line:no-unused-expression
    this.stack = new AppStack(this, name, stackProps)
  }
}
