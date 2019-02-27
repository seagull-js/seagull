import { Secret, SecretParameter } from '@aws-cdk/cdk'
import 'chai/register-should'
import { suite, test } from 'mocha-typescript'

import { BasicTest } from '@seagull/testing'
import { getGitData } from '../../src'

@suite('GetGitHubCreds')
export class Test extends BasicTest {
  async before() {
    await BasicTest.prototype.before.bind(this)()
  }

  async after() {
    await BasicTest.prototype.after.bind(this)()
  }

  @test
  async 'can get github creds'() {
    const branchName = 'test-branch'
    const directRepo = 'repository'
    const directOwner = 'me'
    const packageName = 'test-pkg'
    const pkgRepoName = 'pkg-repo-name'
    const pkgRepoOwner = 'pkg-owner-name'
    const secretParam = new Secret('123456')
    const oauthToken = 'yaq12wsxcde3'
    const props = {
      branch: branchName,
      owner: directOwner,
      pkg: {
        name: packageName,
        repository: {
          type: 'git',
          url: `git+https://github.com/${pkgRepoOwner}/${pkgRepoName}.git`,
        },
      },
      repo: directRepo,
      secretParameter: secretParam,
      token: oauthToken,
    }

    const gitData = getGitData(props)
    gitData.branch.should.be.equals(branchName)
    gitData.owner.should.be.equals(directOwner)
    gitData.repo.should.be.equals(directRepo)
    gitData.secret.resolve().should.be.equals(new Secret(oauthToken).resolve())
  }

  @test
  async 'can get github creds without direct owner, repo or token'() {
    const branchName = 'test-branch'
    const packageName = 'test-pkg'
    const pkgRepoName = 'pkg-repo-name'
    const pkgRepoOwner = 'pkg-owner-name'
    const secretParam = new Secret('123456')
    const props = {
      branch: branchName,
      pkg: {
        name: packageName,
        repository: {
          type: 'git',
          url: `git+https://github.com/${pkgRepoOwner}/${pkgRepoName}.git`,
        },
      },
      secretParameter: secretParam,
    }

    const gitData = getGitData(props)
    gitData.branch.should.be.equals(branchName)
    gitData.owner.should.be.equals(pkgRepoOwner)
    gitData.repo.should.be.equals(pkgRepoName)
    gitData.secret.resolve().should.be.equals(secretParam.resolve())
  }

  @test
  async 'can get github creds without repository block in pkg.json'() {
    const branchName = 'test-branch'
    const directOwner = 'me'
    const packageName = 'test-pkg'
    const secretParam = new Secret('123456')
    const oauthToken = 'yaq12wsxcde3'
    const props = {
      branch: branchName,
      owner: directOwner,
      pkg: {
        name: packageName,
      },
      secretParameter: secretParam,
      token: oauthToken,
    }

    const gitData = getGitData(props)
    gitData.branch.should.be.equals(branchName)
    gitData.owner.should.be.equals(directOwner)
    gitData.repo.should.be.equals(packageName)
    gitData.secret.resolve().should.be.equals(new Secret(oauthToken).resolve())
  }

  @test
  async 'can get faulty config, when nothing is set'() {
    const branchName = 'test-branch'
    const props = {
      branch: branchName,
    }

    const gitData = getGitData(props)
    gitData.branch.should.be.equals(branchName)
    gitData.owner.should.be.equals('noOwner')
    gitData.repo.should.be.equals('noRepo')
    gitData.secret.resolve().should.be.equals(new Secret('noToken').resolve())
  }
}
