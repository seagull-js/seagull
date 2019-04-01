import * as fsModule from 'fs'
import { join } from 'path'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from '../'

export const GenerateCodeEvent = Symbol('Start code generation Event')
export const GeneratedCodeEvent = Symbol('Code generation completed')
export interface CodeGeneratorServiceEvents extends OutputServiceEvents {
  [GenerateCodeEvent]: CodeGeneratorService['handleStartGeneration']
  [GeneratedCodeEvent]: () => void
}

import * as Express from './express'
import * as Lambda from './lambda'
import * as Runner from './runner'
import * as Server from './server'

/**
 * Service which generates necessary wiring code in our dist folder.
 * Currently the different use cases (lambda, server, local development, lazy mode) are hardcoded. A possible refactoring could be other services registering their codegen needs.
 *
 * Input Events:
 * - GenerateCode
 * Output Events:
 * - GeneratedCode
 */
export class CodeGeneratorService {
  bus: ServiceEventBus<CodeGeneratorServiceEvents>
  fs: typeof fsModule
  config = {
    // Our working folder
    appFolder: process.cwd(),
    // only in non release; adds code to runner to bundle pages lazyly
    lazy: true,
    // will the output be a relase bundle?
    release: false,
  }

  constructor(
    bus: CodeGeneratorService['bus'],
    config?: Partial<CodeGeneratorService['config']>,
    fs = fsModule
  ) {
    this.config = { ...this.config, ...config }
    this.fs = fs
    this.bus = bus.on(GenerateCodeEvent, this.handleStartGeneration.bind(this))
  }

  /**
   * Kicks of the right code generation.
   */
  handleStartGeneration() {
    const startGen = process.hrtime()
    this.config.release ? this.genRelease() : this.genDevelopment()
    this.bus.emit(LogEvent, 'CodeGeneratorService', 'generated', {
      time: process.hrtime(startGen),
    })
    this.bus.emit(GeneratedCodeEvent)
  }

  private genRelease() {
    const { appFolder } = this.config
    const dist = join(appFolder, 'dist')
    const _ = [
      {
        content: Express.generate(appFolder, this.fs as any),
        path: join(dist, 'app.js'),
      },
      { path: join(dist, 'server.js'), content: Server.generate(appFolder) },
      { path: join(dist, 'lambda.js'), content: Lambda.generate(appFolder) },
    ].map(this.writeFile)
  }

  private genDevelopment() {
    const { appFolder, lazy } = this.config
    const dist = join(appFolder, 'dist')
    const path = join(dist, 'runner.js')
    const content = Runner.generate(lazy)
    this.writeFile({ path, content })
  }

  private writeFile = (info: { path: string; content: string }) => {
    const { path, content } = info
    const oldContent = this.fs.existsSync(path)
      ? this.fs.readFileSync(path, 'utf-8')
      : null
    // tslint:disable-next-line:no-unused-expression
    oldContent !== content && this.fs.writeFileSync(path, content, 'utf-8')
  }
}
