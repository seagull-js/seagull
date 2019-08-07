import * as os from 'os'

export const buildWorkerId = parseInt(process.env.BUILD_WORKER_ID || '0', 10)
export const buildWorkers = parseInt(process.env.BUILD_WORKER_COUNT || '1', 10)
export const coreCount = os.cpus().length
export const coreRoundRobin = (i: number) => i % buildWorkers === buildWorkerId
export const callPerCore = (func: () => void) =>
  Array.from('x'.repeat(Math.ceil(coreCount / 2))).forEach(func)
