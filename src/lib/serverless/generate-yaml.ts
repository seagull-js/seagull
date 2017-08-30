import * as inflection from 'inflection'
import App from '../app'
import Builder from './builder'

export default function generate(app: App): string {
  // create instance with defaults
  const sls = new Builder(app.name)

  // add backend routes as serverless functions (lambda + apiG)
  for (const func of app.backend) {
    const event = { http: `${func.method} ${func.path}` }
    const baseName = `${app.name} backend ${func.method} ${func.path}`
    const name = inflection.dasherize(
      baseName.replace(/\W+/g, ' ').toLowerCase()
    )
    const fn = { handler: 'handler', timeout: 30, events: [event] }
    sls.addFunction(name, fn)
  }

  // serialize to YAML
  return sls.toYAML()
}
