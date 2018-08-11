/** @module Scaffold */
import { TextGenerator } from '../'

/**
 * Generator for the frontend index.ts file as entry point for rendering
 */
export function FrontendIndexGenerator(pages: string[]) {
  const lines: string[] = []
  // imports
  lines.push(`import { App } from '@seagull/core'`)
  pages.forEach((path, id) => lines.push(`import Page${id} from '${path}'`))

  // registrations
  lines.push('const app = new App()')
  pages.forEach((path, id) => lines.push(`app.register(Page${id})`))
  lines.push('export default app')

  // export as code generator
  const gen = new TextGenerator()
  gen.content = lines.join('\n')
  return gen
}
