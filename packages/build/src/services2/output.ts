import { Console } from 'console'
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
  /**
   * Accepts a log event and "processes" it
   * @param msg
   */
  log(module: string, event: string, data: any) {
    this.console.log(module, event, data)
  }
}

/* Notepad for TS output formatting
import * as ts from 'typescript'


const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: path => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
}
function reportDiagnostic(diagnostic: ts.Diagnostic) {
  !fast && console.error(
    ts.formatDiagnosticsWithColorAndContext([diagnostic], formatHost),
  )
}

function reportWatchStatusChanged(diagnostic: ts.Diagnostic) {
  console.info(ts.formatDiagnostic(diagnostic, formatHost))
}
*/
