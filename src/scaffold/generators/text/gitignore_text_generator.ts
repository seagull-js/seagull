/** @module Scaffold */
import { TextGenerator as Text } from './'

/**
 * the gitignore lines seagull uses by default
 */
export const gitignoreDefaults = ['.seagull', 'dist', 'node_modules']

/**
 * create a .gitignore file for seagull projects using [[gitignoreDefaults]]
 */
export function GitignoreTextGenerator() {
  const gen = new Text(gitignoreDefaults.join('\n'))
  return gen
}
