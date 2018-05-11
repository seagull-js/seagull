import { Job } from '../../../lib'

export default class JobExample extends Job {
  static cycle = 'cron( * * * * * * )'

  async handle(): Promise<void> {
    return
  }
}

export const handler = () => {
  return JobExample.dispatch.bind(JobExample)
}
