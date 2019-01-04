import { App } from '@aws-cdk/cdk'
import { AppStack } from '.'

interface ProjectProps {
  account?: string
  accountId: string
  region: string
  path: string
}

export class ProjectApp extends App {
  constructor(name: string, projectProps: ProjectProps) {
    super()
    const { account, accountId, region, path } = projectProps
    // tslint:disable-next-line:no-unused-expression
    new AppStack(this, name, { accountId, env: { account, path, region } })
  }
}
