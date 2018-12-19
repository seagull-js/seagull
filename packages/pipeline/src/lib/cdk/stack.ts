import * as CB from '@aws-cdk/aws-codebuild'
import * as CP from '@aws-cdk/aws-codepipeline'
import { App, Secret, Stack, StackProps } from '@aws-cdk/cdk'

interface ProjectStackProps extends StackProps {
  env: { account?: string; path: string; region: string }
}

export class AppStack extends Stack {
  pipelineName: string
  pipeline: CP.Pipeline
  source!: CP.GitHubSourceAction

  constructor(parent: App, pipelineName: string, props: ProjectStackProps) {
    super(parent, pipelineName, props)
    this.pipelineName = pipelineName
    this.pipeline = new CP.Pipeline(this, pipelineName, { pipelineName })
    this.addSourceStage()
    this.addBuildStage()
  }

  private addSourceStage() {
    const placement = { atIndex: 0 }
    const stage = this.pipeline.addStage('SourceStage', { placement })
    const branch = 'master'
    const oauthToken = new Secret(process.env.GITHUB_OAUTH)
    // tslint:disable-next-line:no-console
    console.log('OAUTH', process.env.GITHUB_OAUTH)
    const owner = 'AIDACruises'
    const repo = 'unicorn'
    const sourceConfig = { branch, oauthToken, owner, repo, stage }
    // tslint:disable-next-line:no-unused-expression
    this.source = new CP.GitHubSourceAction(this, 'GitHubSource', sourceConfig)
  }

  private addBuildStage() {
    const placement = { atIndex: 1 }
    const buildImage = CB.LinuxBuildImage.UBUNTU_14_04_NODEJS_8_11_0
    const environment = { buildImage }
    const installCmds = []
    installCmds.push('echo "Start installing!"')
    installCmds.push('npm i -g npm')
    installCmds.push('npm ci')
    installCmds.push('echo "Finished installing!"')
    const buildCmds = []
    buildCmds.push('echo "Start building!"')
    buildCmds.push('npm run build')
    buildCmds.push('echo "Finished building!"')
    const postBuildCmds = []
    postBuildCmds.push('echo "Start testing!"')
    postBuildCmds.push('npm run test')
    postBuildCmds.push('echo "Finished testing!"')

    postBuildCmds.push('echo "Start deploying!"')
    postBuildCmds.push('npm run deploy')
    postBuildCmds.push('echo "Finished deploying!"')

    const install = { commands: installCmds }
    const build = { commands: buildCmds }
    const postBuild = { commands: postBuildCmds }
    const phases = { build, install, post_build: postBuild }
    const projectConfig = { buildSpec: { phases, version: '0.2' }, environment }
    const project = new CB.PipelineProject(this, 'BuildProject', projectConfig)
    const stage = this.pipeline.addStage('BuildStage', { placement })
    const buildProps = { project, stage }
    // tslint:disable-next-line:no-unused-expression
    new CB.PipelineBuildAction(this, 'CodeBuild', buildProps)
  }
}
