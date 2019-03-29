import { IMode } from '@seagull/mode'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http pure mode implementation.
 */
@injectable()
export class S3Pure extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'pure' }
}
