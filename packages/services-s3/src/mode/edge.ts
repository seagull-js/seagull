import { IMode } from '@seagull/mode'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http (default) edge mode implementation.
 */
@injectable()
export class S3Edge extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'edge' }
}
