import { App } from '@aws-cdk/cdk'
import { AppStack } from '.'

interface ProjectProps {
  account?: string
  branchName: string
  mode: string
  region: string
  path: string
}

export class ProjectApp extends App {
  constructor(name: string, projectProps: ProjectProps) {
    super()
    const { account, branchName, mode, region, path } = projectProps
    const stackProps = { branchName, env: { account, path, region }, mode }
    // tslint:disable-next-line:no-unused-expression
    new AppStack(this, name, stackProps)
  }
}
