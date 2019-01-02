import * as CB from '@aws-cdk/aws-codebuild'
import { GitHubSourceAction, Pipeline } from '@aws-cdk/aws-codepipeline'
import { App, Secret, SecretParameter, Stack, StackProps } from '@aws-cdk/cdk'
import { logNoOwnerFound } from '../log_messages'

interface ProjectStackProps extends StackProps {
  env: { account?: string; path: string; region: string }
}

export class AppStack extends Stack {
  appPath: string
  pipelineName: string
  pipeline: Pipeline
  source!: GitHubSourceAction

  constructor(parent: App, pipelineName: string, props: ProjectStackProps) {
    super(parent, pipelineName, props)
    this.pipelineName = pipelineName
    this.pipeline = new Pipeline(this, pipelineName, { pipelineName })
    this.appPath = props.env.path
    this.addSourceStage()
    this.addBuildStage()
  }

  private addSourceStage() {
    const placement = { atIndex: 0 }
    const stage = this.pipeline.addStage('SourceStage', { placement })
    const branch = 'master'
    const oauthToken = this.getToken()
    const owner = this.getOwner()
    const repo = this.getRepo()
    const sourceConfig = { branch, oauthToken, owner, repo, stage }
    // tslint:disable-next-line:no-unused-expression
    this.source = new GitHubSourceAction(this, 'GitHubSource', sourceConfig)
    console.info('sourceConfig', sourceConfig)
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
    postBuildCmds.push('NO_PROFILE_CHECK=true;npm run deploy')
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

  private getOwner() {
    return this.getOwnerEnv() || this.getOwnerPkgJson() || this.noOwner()
  }

  private noOwner() {
    logNoOwnerFound()
    return 'noOwner'
  }

  private getOwnerEnv() {
    return process.env.GITHUB_OWNER
  }

  private getOwnerPkgJson() {
    console.info('path', this.appPath)
    const pkgJson = require(`${this.appPath}/package.json`)
    const repoUrl = pkgJson && pkgJson.repository && pkgJson.repository.url
    const isGithubUrl = repoUrl && repoUrl.indexOf('github.com') > -1
    return isGithubUrl && getOwnerFromURL(repoUrl)
  }

  private getRepo() {
    return this.getRepoByEnv() || this.getRepoByPkgJson()
  }

  private getRepoByEnv() {
    return process.env.GITHUB_REPO
  }

  private getRepoByPkgJson() {
    const pkgJson = require(`${this.appPath}/package.json`)
    const repoUrl = pkgJson && pkgJson.repository && pkgJson.repository.url
    const isGithubUrl = repoUrl && repoUrl.indexOf('github.com') > -1
    const repoUrlRepoName = isGithubUrl && getRepoFromURL(repoUrl)
    return repoUrlRepoName || pkgJson.name
  }

  private getToken() {
    return this.getTokenByEnv() || this.getTokenBySSM()
  }

  private getTokenByEnv() {
    return process.env.GITHUB_OAUTH && new Secret(process.env.GITHUB_OAUTH)
  }

  private getTokenBySSM() {
    const ssmParameter = process.env.GITHUB_SSM_PARAMETER || 'GitHubOAuthToken'
    const secretConfig = { ssmParameter }
    return new SecretParameter(this, 'GithubToken', secretConfig).value
  }
}

function getOwnerFromURL(url: string) {
  const path = url.substring(url.indexOf('github.com') + 10)
  return path.substring(1, path.indexOf('/', 1))
}

function getRepoFromURL(url: string) {
  const path = url.substring(url.indexOf('github.com') + 10)
  return path.slice(path.indexOf('/', 1) + 1, path.indexOf('.git'))
}
