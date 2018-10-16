import * as serverless from 'serverless-http'
import app from './_app'

module.exports.handler = serverless(app, {
  // Your Content-Type is matched against this and base64 encoding is automatically
  // done for your payload. This also sets isBase64Encoded true for the Lambda response
  // to API Gateway by this library
  binary: ['image/*'],
  request: (request: any, event: any, context: any) => {
    // tslint:disable-next-line:no-console
    console.log(request)
  },
  response: (response: any, event: any, context: any) => {
    // tslint:disable-next-line:no-console
    console.log(response)
  },
})

function config(stage: string) {
  const integration = 'lambda-proxy'
  const method = 'ANY'
  const http1 = { integration, method, path: '/', private: false }
  const http2 = { integration, method, path: '/{any+}', private: false }
  return {
    description: 'universal route',
    events: [{ http: http1 }, { http: http2 }],
    handler: 'dist/assets/backend/lambda.handler',
    name: `helloworld-${stage}-handler`,
    tags: { service: 'helloworld' },
  }
}
export const test = () => config('test')
export const prod = () => config('prod')
