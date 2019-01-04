import { App } from '@aws-cdk/cdk'
import { AppStack } from '.'

interface ProjectProps {
  account?: string
  s3Name: string
  region: string
  path: string
}

export class ProjectApp extends App {
  constructor(name: string, projectProps: ProjectProps) {
    super()
    const { account, s3Name, region, path } = projectProps
    // tslint:disable-next-line:no-unused-expression
    new AppStack(this, name, { s3Name, env: { account, path, region } })
  }
}
