import { Mode } from '@seagull/mode'
import { config } from '@seagull/seed'
import { ContainerModule, interfaces } from 'inversify'
import { S3 } from './mode/cloud'
import { S3Edge } from './mode/edge'
import { S3Pure } from './mode/pure'
import { S3Seed } from './mode/seed'

/**
 * Injectable container module.
 * Loadable Module containing S3 service bindings by seagull mode environment.
 */
export const module = new ContainerModule((bind: interfaces.Bind) => {
  bind(S3)
    .toSelf()
    .when(
      () => Mode.environment === 'cloud' || Mode.environment === 'connected'
    )
  bind(S3)
    .to((S3Edge as any) as typeof S3)
    .when(() => Mode.environment === 'edge')
  bind(S3)
    .to((S3Pure as any) as typeof S3)
    .when(() => Mode.environment === 'pure' && !config.seed)
  bind(S3)
    .to((S3Seed as any) as typeof S3)
    .when(() => Mode.environment === 'pure' && config.seed)
})
