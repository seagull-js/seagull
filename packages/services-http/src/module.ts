import { Mode } from '@seagull/mode'
import { config } from '@seagull/seed'
import { ContainerModule, interfaces } from 'inversify'
import { HttpJson } from './content-type/http_json'
import { Http } from './mode/cloud'
import { HttpPure } from './mode/pure'
import { HttpSeed } from './mode/seed'

/**
 * Injectable container module
 */
export const module = new ContainerModule((bind: interfaces.Bind) => {
  bind(Http)
    .toSelf()
    .when(
      () =>
        Mode.environment === 'cloud' ||
        Mode.environment === 'connected' ||
        Mode.environment === 'edge'
    )
  bind(Http)
    .to(HttpPure)
    .when(() => Mode.environment === 'pure' && !config.seed)
  bind(Http)
    .to(HttpSeed)
    .when(() => Mode.environment === 'pure' && config.seed)

  bind(HttpJson).toSelf()
})
