import { logNoGitRepoFound, logNoOwnerFound } from './log_messages'

export interface GitProps {
  owner?: string
  repository?: string
  token?: string
  ssmParameter?: string
}

export function getGitData(branch: string, pkg?: any, git?: GitProps) {
  return {
    branch,
    owner: getOwner(pkg, git),
    repo: getRepo(pkg, git),
  }
}

function getOwner(pkg?: any, git?: GitProps) {
  return (git && git.owner) || getOwnerPkgJson(pkg) || noOwner()
}

function getOwnerPkgJson(pkg: any) {
  const repoUrl = pkg && pkg.repository && pkg.repository.url
  const isGithubUrl = repoUrl && repoUrl.indexOf('github.com') > -1
  return isGithubUrl && getOwnerFromURL(repoUrl)
}

function getOwnerFromURL(url: string) {
  const path = url.substring(url.indexOf('github.com') + 10)
  return path.substring(1, path.indexOf('/', 1))
}

function noOwner() {
  logNoOwnerFound()
  return 'noOwner'
}

function getRepo(pkg?: any, git?: GitProps) {
  return (git && git.repository) || (pkg && getRepoPkgJson(pkg)) || noRepo()
}

function getRepoPkgJson(pkg: any) {
  const repoUrl = pkg && pkg.repository && pkg.repository.url
  const isGithubUrl = repoUrl && repoUrl.indexOf('github.com') > -1
  const repoUrlRepoName = isGithubUrl && getRepoFromURL(repoUrl)
  return repoUrlRepoName || pkg.name
}

function noRepo() {
  logNoGitRepoFound()
  return `noRepo`
}

function getRepoFromURL(url: string) {
  const path = url.substring(url.indexOf('github.com') + 10)
  return path.slice(path.indexOf('/', 1) + 1, path.indexOf('.git'))
}
