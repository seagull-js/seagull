# http (injectable)

> Injectable library for http requests using [http-fetch](https://github.com/bitinn/node-fetch).

- Implements seagull environment mode (cloud, connected, edge, pure)
- Implements seed data generation for test cases

### Usage

The basic fetch function can be called like this:

```javascript
import { Http } from '@seagull/services-http'
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

For convinience, you can use a content-specific adapters as well:

```javascript
import { HttpJson } from '@seagull/services-http'
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
import { containerModule } from '@seagull/services-http'
import { Container } from 'inversify'

const injector = new Container()
injector.load(containerModule)
```

### Mode behavior

- _cloud_ : returns response of the external resource (as defined via url/config)
- _connected_ : same as cloud
- _edge_ : same as cloud
- _pure_ : returns local seed data (throws an error if no seed data is available)

#### Configuration hooks

See `@seagull/seed` README for details.