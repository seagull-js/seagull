export interface IFunction {
  handler: string
  timeout: number
  events: { [source: string]: string }
}

export interface IIAMRoleStatement {
  Effect: string
  Action: string[]
  Resource: string
}

export interface IProvider {
  name: string
  runtime: string
  timeout: number
  region: string
  stage: string
  iamRoleStatements: IIAMRoleStatement[]
}

export interface IServerless {
  service: string
  frameworkVersion: string
  plugins: string[]
  provider: IProvider
  functions: { [name: string]: IFunction }
  package?: {
    include: string[]
    exclude: string[]
  }
  resources?: any // TODO: DynamoDB tables n stuff
}
