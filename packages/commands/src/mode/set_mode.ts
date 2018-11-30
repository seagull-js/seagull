import { Command } from '../Command'
import { IMode, Mode } from './definition'

/**
 * Command for setting modes globally
 */
export class SetMode extends Command {
  /**
   * Key to set for [[Mode]]
   */
  key: keyof IMode

  /**
   * Value to set for [[Mode]] for key
   */
  value: IMode[keyof IMode]

  /**
   * Value of modified key from [[Mode]] at execution
   */
  lastKeyValue!: IMode[keyof IMode]

  /**
   * [[Mode]]  Singleton without readonly property
   */
  mode: IMode = Mode

  /**
   * see the individual property descriptions within this command class
   */
  constructor(key: keyof IMode, value: IMode[typeof key]) {
    super()
    this.value = value
    this.key = key
  }

  /**
   * Sets the configured mode in the singleton
   */
  async execute() {
    this.lastKeyValue = this.mode[this.key]
    this.mode[this.key] = this.value
  }

  /**
   * Reverts the mode to the state at the point of exeuction
   */
  async revert() {
    this.mode[this.key] = this.lastKeyValue
  }
}
