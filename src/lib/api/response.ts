export default class Response {
  static json(code, data): Response {
    const headers = { 'Content-Type': 'application/json; charset=utf-8' }
    const body = JSON.stringify(data, null, 2)
    return new Response(code, body, headers)
  }

  static text(code, data): Response {
    const headers = { 'Content-Type': 'text/plain; charset=utf-8' }
    return new Response(code, data, headers)
  }

  statusCode: number
  body: string
  headers: { [key: string]: string }

  constructor(code: number, body: string, headers: { [key: string]: string }) {
    this.statusCode = code
    this.body = body
    this.headers = headers
  }
}
