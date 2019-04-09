// tslint:disable:no-unused-expression
import {
  createFolderRecursive,
  removeFolderRecursive,
} from '@seagull/libraries'
import 'chai/register-should'

import { BasicTest } from '@seagull/testing'
import * as chai from 'chai'
import { expect } from 'chai'

import { Console } from 'console'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'
import { exit } from 'shelljs'
import * as stream from 'stream-buffers'
import * as OP from '../../src/operators'
import * as Services from '../../src/services'

@suite('Operator::Integration')
export class Test extends BasicTest {
  @test
  async 'can init dev operator'() {
    const op = new OP.DevOperator({})
  }

  @test
  @timeout(20000)
  async 'release operator builds a valid project'() {
    const pre = process.cwd()
    const appFolder = setupProject(pre)

    process.chdir(appFolder)
    const op = new OP.ReleaseOperator({ typeCheck: true })
    const stdout = new stream.WritableStreamBuffer() as any
    op.services.Output.console = new Console(stdout)

    const operatorEvents = Promise.all([
      op.promisifyEmitOnce(Services.BundledVendorEvent),
      op.promisifyEmitOnce(Services.PreparedEvent),
      op.promisifyEmitOnce(Services.CompiledEvent),
      op.promisifyEmitOnce(Services.GeneratedCodeEvent),
      op.promisifyEmitOnce(OP.PageOperator.DoneEvent),
      op.promisifyEmitOnce(OP.ReleaseOperator.DoneEvent),
      op.promisifyEmitOnce(Services.BundledLambdaEvent),
      op.promisifyEmitOnce(Services.BundledServerEvent),
    ])

    op.emit(OP.ReleaseOperator.StartEvent)
    await operatorEvents
    // no crash -> compile successfull
    // begin asserts that project build is correct
    const assets = join.bind(this, appFolder, 'dist/assets')

    fs.existsSync(assets('pages', 'HelloPage.js')).should.be.true
    fs.existsSync(assets('pages', 'HelloPage-server.js')).should.be.true
    fs.existsSync(assets('pages', 'HelloPage-server.js')).should.be.true

    fs.existsSync(assets('backend', 'server.js')).should.be.true
    fs.existsSync(assets('backend', 'lambda.js')).should.be.true
    fs.existsSync(assets('static', 'vendor.js')).should.be.true
    fs.existsSync(assets('static', 'images')).should.be.true
    // cleanup
    process.chdir(pre)
  }
}

const setupProject = (cwd: string) => {
  const appFolder = join(cwd, '.data')
  const exampleFolder = join(cwd, '..', '..', 'examples', 'helloworld')
  const routePath = join('src', 'routes')
  const pagePath = join('src', 'pages')
  removeFolderRecursive(appFolder)
  createFolderRecursive(appFolder)
  createFolderRecursive(join(appFolder, 'static', 'images'))
  createFolderRecursive(join(appFolder, routePath))
  createFolderRecursive(join(appFolder, pagePath))

  fs.copyFileSync(
    join(exampleFolder, 'tsconfig.build.json'),
    join(appFolder, 'tsconfig.build.json')
  )
  fs.copyFileSync(
    join(exampleFolder, 'tsconfig.json'),
    join(appFolder, 'tsconfig.json')
  )

  fs.copyFileSync(
    join(exampleFolder, routePath, 'index_route.ts'),
    join(appFolder, routePath, 'index_route.ts')
  )
  fs.copyFileSync(
    join(exampleFolder, pagePath, 'HelloPage.tsx'),
    join(appFolder, pagePath, 'HelloPage.tsx')
  )
  fs.symlinkSync(
    join(exampleFolder, 'node_modules'),
    join(appFolder, 'node_modules'),
    'dir'
  )
  return appFolder
}
