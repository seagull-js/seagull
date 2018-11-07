import { Item } from '@seagull/plugin-items'

export class Term extends Item {
  id: string
  definition: string

  constructor(word: string, definition: string) {
    super()
    this.id = word
    this.definition = definition
  }
}
