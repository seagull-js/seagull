import { App } from '@aws-cdk/cdk'
import { AppStack } from '.'

interface ProjectProps {
  account?: string
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
    const stackProps = { s3Name, env: { account, path, region }, deployS3 }
    // tslint:disable-next-line:no-unused-expression
    this.stack = new AppStack(this, name, stackProps)
  }
}
