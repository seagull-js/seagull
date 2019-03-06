export { ReadLog } from './read_log'
export { WriteLog } from './write_log'
export { WriteLogs } from './write_logs'
export * from './logging_sandbox'

export type LogLevel = 'info' | 'debug' | 'warn' | 'error'
export type Message = string | object | number | any[]
