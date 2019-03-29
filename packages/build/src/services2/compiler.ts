import * as ts from 'typescript'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from './'
import * as fs from 'fs'
import { join } from 'path'
export const CompileEvent = Symbol('Start code generation Event')
export const CompiledEvent = Symbol('Code generation completed')
export interface CompilerServiceEvents extends OutputServiceEvents {
  [CompileEvent]: CompilerService['handleStartCompilation']
  [CompiledEvent]: () => void
}

type CompilerHost = ts.WatchCompilerHostOfConfigFile<
  ts.EmitAndSemanticDiagnosticsBuilderProgram
>
type CreateProgram = CompilerHost['createProgram']
type AfterProgramCreate = CompilerHost['afterProgramCreate']

export class CompilerService {
  bus: ServiceEventBus<CompilerServiceEvents>
  compilerHost!: CompilerHost
  config = {
    fast: false,
    watch: true,
  }

  constructor(bus: CompilerService['bus']) {
    this.bus = bus.on(CompileEvent, this.handleStartCompilation)
  }

  handleStartCompilation = () => {
    this.compilerHost = this.createCompilerHost()
    this.patchCompilerHost(this.compilerHost)
    ts.createWatchProgram(this.compilerHost)
    this.bus.emit(CompiledEvent)
  }

  private patchCompilerHost(host: CompilerHost) {
    const { createProgram, afterProgramCreate } = host
    host.createProgram = this.wrapCreateProgram(createProgram)
    host.afterProgramCreate = this.wrapAfterProgramCreate(afterProgramCreate)
  }

  private createCompilerHost() {
    const tsName = 'tsconfig.build.json'
    const config = ts.findConfigFile(process.cwd(), ts.sys.fileExists, tsName)

    return ts.createWatchCompilerHost(
      config!,
      {},
      ts.sys,
      ts.createEmitAndSemanticDiagnosticsBuilderProgram,
      this.logDiagnostics('diagnostic'),
      this.logDiagnostics('watch')
    )
  }

  private wrapEmit = (onEmit: ts.Program['emit']) => (...args: any) => {
    const emitted = onEmit(...args)
    this.bus.emit(LogEvent, 'CompilerService', 'compiled', {})
    this.bus.emit(CompiledEvent)
    return emitted
  }

  private wrapCreateProgram = (creator: CreateProgram) => (
    roots?: ReadonlyArray<string>,
    options = {},
    host?: ts.CompilerHost,
    prevProg?: ts.EmitAndSemanticDiagnosticsBuilderProgram
  ) => {
    options = this.config.fast ? options : this.setTranspileOnly(options)
    const prog = creator(roots, options, host, prevProg)
    this.bus.emit(LogEvent, 'CompilerService', 'createCompiler', {})
    prog.emit = this.wrapEmit(prog.emit)
    return prog
  }

  // tslint:disable-next-line:no-empty
  private wrapAfterProgramCreate = (hook: AfterProgramCreate = () => {}) => (
    program: ts.EmitAndSemanticDiagnosticsBuilderProgram
  ) => {
    this.bus.emit(LogEvent, 'CompilerService', 'createdCompiler', {})
    hook(program)
  }

  private logDiagnostics = (type: string) => (diagnostic: ts.Diagnostic) => {
    this.bus.emit(LogEvent, 'CompilerService', type, { diagnostic })
  }

  private setTranspileOnly(options: ts.CompilerOptions) {
    return {
      ...options,
      allowNonTsExtensions: true,
      composite: undefined,
      declaration: undefined,
      declarationDir: undefined,
      isolatedModules: true,
      lib: undefined,
      noEmit: undefined,
      noEmitOnError: undefined,
      noLib: true,
      noResolve: true,
      out: undefined,
      outFile: undefined,
      paths: undefined,
      rootDirs: undefined,
      suppressOutputPathCheck: true,
      types: undefined,
    }
  }
}
