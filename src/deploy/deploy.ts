import { join } from 'path'

export abstract class DeployCommand {
  srcFolder: string

  tmpFolder: string

  constructor(srcFolder: string) {
    this.srcFolder = srcFolder
    this.tmpFolder = join(srcFolder, '.seagull')
  }

  abstract async execute(): Promise<void>
}
