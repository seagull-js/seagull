import { APIGatewayEvent } from 'aws-lambda'
import App from '../app'

export default function dispatch(event: APIGatewayEvent, _, fn) {
  const query = event.queryStringParameters
  const path = event.path
  const pathParameters = event.pathParameters
  const headers = event.headers
  const method = event.httpMethod
}
