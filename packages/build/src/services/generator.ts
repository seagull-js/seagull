import { CommandService } from '@seagull/commands'
import { FS } from '@seagull/commands-fs'
import * as path from 'path'
import { Generate } from '../generate'

export class Generator extends CommandService {
  /**
   * reference to where the app code resides in
   */
  appFolder: string

  constructor(appFolder: string) {
    super()
    this.appFolder = appFolder
  }

  async initialize() {
    this.registerAppFileGeneration()
    this.registerServerFileGeneration()
    this.registerLambdaFileGeneration()
    this.registerCronFileGeneration()
  }

  private registerAppFileGeneration(name: string = 'app.js') {
    const location = path.join(this.appFolder, 'dist', 'app.js')
    this.register(name, new Generate.Express(this.appFolder, location))
  }

  private registerServerFileGeneration(name: string = 'server.js') {
    const location = path.join(this.appFolder, 'dist', 'server.js')
    this.register(name, new Generate.Server(location))
  }

  private registerLambdaFileGeneration(name: string = 'lambda.js') {
    const location = path.join(this.appFolder, 'dist', 'lambda.js')
    this.register(name, new Generate.Lambda(location))
  }

  private registerCronFileGeneration(name: string = 'cron.json') {
    const location = path.join(this.appFolder, 'dist', 'cron.json')
    this.register(name, new Generate.Crons(this.appFolder, location))
  }
}
