/** @module Scaffold */
import { TextGenerator as Text } from './'

/**
 * Does what the name says: create an EMPTY text file
 */
export function EmptyTextGenerator() {
  return new Text('')
}
