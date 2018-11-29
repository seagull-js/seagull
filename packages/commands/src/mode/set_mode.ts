import * as fs from 'fs'
import { Command } from '../Command'

export type Environments =
  // Self contained, cloud-less runtime like edge computing or dev server
  | 'edge'
  // self contained, cloud-less runtime but resets each time. e.g. tests with no side effects and mocked services
  | 'pure'
  // cloud runtime, uses real aws services, always online
  | 'cloud'
  // does not run in aws cloud but uses real aws services, sync for edge computing or debugging on dev server with real data scenarios
  | 'connected'

export type IMode = {
  environment: Environments
}

/**
 * Module based singleton containing the configured truth of modes
 */
export const Mode: Readonly<IMode> = {
  environment: 'edge' as Environments,
}

/**
 * Command for setting modes globally
 */
export class SetMode implements Command {
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
