import { IMode } from '@seagull/mode'
import { injectable } from 'inversify'
import 'reflect-metadata'
import { S3Base } from './base'

/**
 * Http (default) cloud mode implementation.
 */
@injectable()
export class S3 extends S3Base {
  protected mode: Readonly<IMode> = { environment: 'cloud' }
}
