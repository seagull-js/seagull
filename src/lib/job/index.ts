import { APIGatewayEvent as Event, Callback as CB, Context } from 'aws-lambda'

/**
 * Basic class for a "Backend" API Route.
 */

export type Callback = (error: Error, data: Response) => void

export default class Job {
  // job cron/schedule expression
  static cycle: string

  // This will be invoked by AWS Lambda. Do not touch.
  static async dispatch(event: Event, context: Context, fn: Callback) {
    const job: Job = this.create()
    try {
      await job.handle()
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log('ERROR:', error)
    }
    // we dont use the error callback of lambda because that would trigger
    // the default response of job-Gateway, removing easy header control
    fn(null, null)
  }

  // convenience helper for `dispatch()`, useful for testing & devserver
  static async dispatchPromise(event: Event, ctx: Context) {
    return new Promise<Response>((resolve, reject) => {
      this.dispatch(event, ctx, (error, result) => {
        return error ? reject(error) : resolve(result)
      })
    })
  }

  // indirection helper for 'this' magic. Do not refactor into dispatch() above!
  static create<T extends Job>(): T {
    return new this() as T
  }

  // this function contains your business logic code, will be overriden
  async handle(): Promise<void> {
    return
  }
}
