import { Mode } from '@seagull/mode'
import { ContainerModule, interfaces } from 'inversify'
import { config } from './config'
import { HttpJson } from './content-type/http_json'
import { Http } from './modes/cloud'
import { HttpPure } from './modes/pure'
import { HttpSeed } from './modes/seed'

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
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
