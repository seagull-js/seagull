/** @module Scaffold */
import { TextGenerator as Text } from './'

const defaults = ['.seagull', 'dist', 'node_modules']

export function GitignoreTextGenerator(lines: string[] = defaults) {
  const gen = new Text(lines.join('\n'))
  return gen
}
