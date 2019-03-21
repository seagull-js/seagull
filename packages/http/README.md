# http (injectable)

> Injectable library for http requests using [http-fetch](https://github.com/bitinn/node-fetch).

- Implements seagull environment mode (cloud, connected, edge, pure)
- Implements seed data generation for test cases

### Usage

The basic fetch command can be used like this:

```javascript
import { Http } from '@seagull/http'
...
class ... {
  // inject http implementation
  constructor(private http: Http) {}
  doSomething() {
    const response = await this.http.get(url)
    const json = await response.json()
  }
}
```

For convinience, you can use content-specific adapters as well:

```javascript
import { HttpJson } from '@seagull/http'
...
class ... {
  // inject http implementation
  constructor(private http: HttpJson) {}
  doSomething() {
    try {
      const json = this.http.get(url)
    } catch (err) {
      ...
    }

  }
}
```

### Bootstrap

```javascript
import { containerModule } from '@seagull/http'
import { Container } from 'inversify'

const injector = new Container()
injector.load(containerModule)
```

### Mode behavior

- _cloud_ : returns response of the external resource (as defined via url/config)
- _connected_ : same as cloud
- _edge_ : same as cloud
- _pure_ : returns local seed data (throws an error if no seed data is available)

### Seed data generation

Use global switch to enable seed data generation while http request:

```javascript
import { config } from '@seagull/http'

config.seed = true
...
// do your thing
...
config.seed = false
```

The seed data can be fetched in any mode except pure, as tests within the code pipeline should not call external ressources.

#### Configuration hooks

In case you want to modify the seed creation for a specific case, you can create a specific _SeedLocalConfig_ by creating a TypeScript-file within the seed folder structure:

```javascript
import { SeedLocalConfig } from '@seagull/commands-http/seedLocalConfig'

export default <SeedLocalConfig<SomeResponse>>{
  hook: (fixture: SomeResponse) => {
    // do something, e.g. slice some arrays within the fixture
    return fixture
  },
  expiresInDays: 14, // fixture will be re-fetched after 14 days
}

```

A configuration file is applied for all subsequent fixtures.
