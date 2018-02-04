/**
 * See http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format
 * for more details about how this object must look like.
 */

export default class Response {
  statusCode: number
  body: string
  headers: { [key: string]: string }

  constructor(code: number, body: string, headers: { [key: string]: string }) {
    this.statusCode = code
    this.body = body
    this.headers = headers
  }
}
