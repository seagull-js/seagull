import * as ts from 'typescript'
import { LogEvent, OutputServiceEvents, ServiceEventBus } from './'

export const CompileEvent = Symbol('Start code generation Event')
export const CompiledEvent = Symbol('Code generation completed')
export const CompileError = Symbol('Error during compile')

export interface CompilerServiceEvents extends OutputServiceEvents {
  [CompileEvent]: CompilerService['handleStartCompilation']
  [CompiledEvent]: () => void
  [CompileError]: () => void
}

type CompilerHost = ts.WatchCompilerHostOfConfigFile<
  ts.EmitAndSemanticDiagnosticsBuilderProgram
>
type CreateProgram = CompilerHost['createProgram']
type AfterProgramCreate = CompilerHost['afterProgramCreate']

const tsName = 'tsconfig.build.json'

export class CompilerService {
  bus: ServiceEventBus<CompilerServiceEvents>
  compilerHost!: CompilerHost
  compileTimer?: [number, number]
  config = {
    fast: false,
    watch: true,
  }

  constructor(
    bus: CompilerService['bus'],
    config?: Partial<CompilerService['config']>
  ) {
    Object.assign(this.config, config)
    this.bus = bus.on(CompileEvent, this.handleStartCompilation)
  }

  handleStartCompilation = () => {
    this.compilerHost = this.createCompilerHost()
    this.patchCompilerHost(this.compilerHost)
    ts.createWatchProgram(this.compilerHost)
  }

  private patchCompilerHost(host: CompilerHost) {
    const { createProgram, afterProgramCreate } = host
    host.createProgram = this.addConfigurationAndInstrumentation(createProgram)
    host.afterProgramCreate = this.addAfterPCInstrumentation(afterProgramCreate)
  }

  private createCompilerHost() {
    const cfgPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, tsName)
    return ts.createWatchCompilerHost(
      cfgPath!,
      {},
      ts.sys,
      ts.createEmitAndSemanticDiagnosticsBuilderProgram,
      this.logDiagnostics('diagnostic'),
      this.logDiagnostics('watch')
    )
  }

  private addInstrumentationToEmit = (onEmit: ts.Program['emit']) => (
    ...args: any
  ) => {
    const emitted = onEmit(...args)
    const time = process.hrtime(this.compileTimer!)
    this.bus.emit(LogEvent, 'CompilerService', 'compiled', { time })
    this.bus.emit(CompiledEvent)
    return emitted
  }

  private addConfigurationAndInstrumentation = (creator: CreateProgram) => (
    roots?: ReadonlyArray<string>,
    _ = {} as any,
    host?: ts.CompilerHost,
    prevProg?: ts.EmitAndSemanticDiagnosticsBuilderProgram
  ) => {
    const cfgPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, tsName)
    const cfg = ts.getParsedCommandLineOfConfigFile(cfgPath!, {}, host! as any)
    // tslint:disable-next-line:no-unused-expression
    this.config.fast && this.setTranspileOnly(cfg!.options)
    const prog = creator(roots, cfg!.options, host, prevProg)
    this.bus.emit(LogEvent, 'CompilerService', 'createCompiler', {})
    prog.emit = this.addInstrumentationToEmit(prog.emit)
    return prog
  }

  private addAfterPCInstrumentation = (
    // tslint:disable-next-line:no-empty
    hook: AfterProgramCreate = () => {}
  ) => (program: ts.EmitAndSemanticDiagnosticsBuilderProgram) => {
    this.bus.emit(LogEvent, 'CompilerService', 'createdCompiler', {})
    hook(program)
  }

  private logDiagnostics = (type: string) => (diagnostic: ts.Diagnostic) => {
    if (diagnostic.code === 6031 || diagnostic.code === 6032) {
      this.compileTimer = process.hrtime()
    }
    this.bus.emit(LogEvent, 'CompilerService', type, { diagnostic })
    this.checkForCompileError(diagnostic)
  }

  private checkForCompileError = (diag: ts.Diagnostic) => {
    const isError = diag.category === ts.DiagnosticCategory.Error
    return isError && this.bus.emit(CompileError)
  }

  private setTranspileOnly(options: ts.CompilerOptions) {
    Object.assign(options, {
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
    })
  }
}
