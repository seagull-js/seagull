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
