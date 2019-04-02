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
const cfgPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, tsName)

export class CompilerService {
  bus: ServiceEventBus<CompilerServiceEvents>
  compilerHost!: CompilerHost
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
    host.createProgram = this.wrapCreateProgram(createProgram)
    host.afterProgramCreate = this.wrapAfterProgramCreate(afterProgramCreate)
  }

  private createCompilerHost() {
    return ts.createWatchCompilerHost(
      cfgPath!,
      {},
      ts.sys,
      ts.createEmitAndSemanticDiagnosticsBuilderProgram,
      this.logDiagnostics('diagnostic'),
      this.logDiagnostics('watch')
    )
  }

  private wrapEmit = (onEmit: ts.Program['emit']) => (...args: any) => {
    const emitted = onEmit(...args)
    this.checkForCompileError(emitted.diagnostics)
    this.bus.emit(LogEvent, 'CompilerService', 'compiled', {})
    this.bus.emit(CompiledEvent)
    return emitted
  }

  private wrapCreateProgram = (creator: CreateProgram) => (
    roots?: ReadonlyArray<string>,
    _ = {} as any,
    host?: ts.CompilerHost,
    prevProg?: ts.EmitAndSemanticDiagnosticsBuilderProgram
  ) => {
    const cfg = ts.getParsedCommandLineOfConfigFile(cfgPath!, {}, host! as any)
    // tslint:disable-next-line:no-unused-expression
    this.config.fast && this.setTranspileOnly(cfg!.options)
    const prog = creator(roots, cfg!.options, host, prevProg)
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

  private checkForCompileError = (diags: ReadonlyArray<ts.Diagnostic>) => {
    const isError =
      diags.findIndex(d => d.category === ts.DiagnosticCategory.Error) !== -1
    const logDiag = this.logDiagnostics('diagnostic')
    return isError && diags.map(logDiag) && this.bus.emit(CompileError)
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
