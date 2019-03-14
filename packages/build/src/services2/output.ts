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
  constructor(
    bus: ServiceEventBus<OutputServiceEvents>,
    { stdout = process.stdout, stderr = process.stderr }
  ) {
    bus.on(LogEvent, this.log.bind(this))
    this.console = new Console(stdout, stderr)
  }
  /**
   * Accepts a log event and "processes" it
   * @param msg
   */
  log(module: string, event: string, data: any) {
    this.console.log(this, module, event, data)
  }
}
