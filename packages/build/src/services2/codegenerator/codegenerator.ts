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

export class CodeGeneratorService {
  bus: ServiceEventBus<CodeGeneratorServiceEvents>
  fs: typeof fsModule
  config = {
    // Our working folder
    appFolder: process.cwd(),
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

  handleStartGeneration() {
    const startGen = process.hrtime()
    this.config.release ? this.genRelease() : this.genDevelopment()
    this.bus.emit(LogEvent, 'CodeGeneratorService', 'generated', {
      time: process.hrtime(startGen),
    })
    this.bus.emit(GeneratedCodeEvent)
  }

  genRelease() {
    const { appFolder } = this.config
    const dist = join(appFolder, 'dist')
    const _ = [
      {
        content: Express.generate(appFolder, this.fs as any),
        path: join(dist, 'app.js'),
      },
      { path: join(dist, 'server.js'), content: Server.generate(appFolder) },
      { path: join(dist, 'lambda.js'), content: Lambda.generate(appFolder) },
    ].map(({ path, content }) => this.fs.writeFileSync(path, content, 'utf-8'))
  }

  genDevelopment() {
    const { appFolder } = this.config
    const dist = join(appFolder, 'dist')
    const path = join(dist, 'runner.js')
    const content = Runner.generate(appFolder)
    this.fs.writeFileSync(path, content, 'utf-8')
  }
}
