import { Console } from 'console'
import * as ts from 'typescript'

import * as process from 'process'
import { ServiceEventBus } from './'

export const LogEvent = Symbol('Logging Event')

export interface OutputServiceEvents {
  [LogEvent]: OutputService['log']
}

/**
 * Servic for communicating with our dev. Think frontend.
 * Accepts Logs from other Services and decides how and what to display.
 * Think: https://github.com/mgrip/react-cli or https://github.com/Yomguithereal/react-blessed :D
 *
 * Input Events
 * - LogEvent
 * Output Events:
 * - none
 */
export class OutputService {
  console: Console
  bus: ServiceEventBus<OutputServiceEvents>

  constructor(
    bus: OutputService['bus'],
    { stdout = process.stdout, stderr = process.stderr }
  ) {
    this.bus = bus
    this.bus.on(LogEvent, this.log.bind(this))
    this.console = new Console(stdout, stderr)
  }

  logTSCDiagnostic = (diagnostic: ts.Diagnostic) =>
    this.console.error(
      ts.formatDiagnosticsWithColorAndContext([diagnostic], formatHost)
    )

  logTSCWatchStatus = (diagnostic: ts.Diagnostic) =>
    this.console.info(ts.formatDiagnostic(diagnostic, formatHost))

  /**
   * Accepts a log event and "processes" it
   * @param msg
   */
  log(module: string, event: string, data: any) {
    if (data && data.time) {
      data.time = `${data.time[0]}s ${(data.time[1] / 1000000).toFixed()}ms`
    }
    const type = `${module}:${event}`
    switch (type) {
      case 'CompilerService:diagnostic':
        this.logTSCDiagnostic(data.diagnostic)
        break
      case 'CompilerService:watch':
        this.logTSCWatchStatus(data.diagnostic)
        break
      default:
        this.console.log(module, event, data)
    }
  }
}

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
}
