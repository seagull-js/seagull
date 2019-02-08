import { Secret, SecretParameter } from '@aws-cdk/cdk'

import * as log from './log_messages'

interface GitDataProps {
  branch: string
  owner?: string
  pkg?: any
  repo?: string
  secretParameter?: SecretParameter
  token?: string
}

export function getGitData(props: GitDataProps) {
  return {
    branch: props.branch,
    owner: getOwner(props),
    repo: getRepo(props),
    secret: getSecret(props),
  }
}

function getSecret(props: GitDataProps) {
  const secretParam = props.secretParameter && props.secretParameter.value
  return getTokenDirect(props) || secretParam || noToken()
}

function noToken() {
  log.logNoGithubTokenFound()
  return new Secret('noToken')
}

function getTokenDirect(props: GitDataProps) {
  return props.token && new Secret(props.token)
}

function getOwner(props: GitDataProps) {
  return props.owner || (props.pkg && getOwnerPkgJson(props.pkg)) || noOwner()
}

function getOwnerPkgJson(pkg: any) {
  const repoUrl = pkg.repository && pkg.repository.url
  const isGithubUrl = repoUrl && repoUrl.indexOf('github.com') > -1
  return isGithubUrl && getOwnerFromURL(repoUrl)
}

function getOwnerFromURL(url: string) {
  const path = url.substring(url.indexOf('github.com') + 10)
  return path.substring(1, path.indexOf('/', 1))
}

function noOwner() {
  log.logNoOwnerFound()
  return 'noOwner'
}

function getRepo(props: GitDataProps) {
  return props.repo || (props.pkg && getRepoPkgJson(props.pkg)) || noRepo()
}

function getRepoPkgJson(pkg: any) {
  const repoUrl = pkg.repository && pkg.repository.url
  const isGithubUrl = repoUrl && repoUrl.indexOf('github.com') > -1
  const repoUrlRepoName = isGithubUrl && getRepoFromURL(repoUrl)
  return repoUrlRepoName || pkg.name
}

function noRepo() {
  log.logNoGitRepoFound()
  return `noRepo`
}

function getRepoFromURL(url: string) {
  const path = url.substring(url.indexOf('github.com') + 10)
  return path.slice(path.indexOf('/', 1) + 1, path.indexOf('.git'))
}
