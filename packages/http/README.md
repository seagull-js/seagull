# command-http

> Command for http requests, implements seed data generation for test cases.

The command can be used like this:

```javascript
import { Http, RequestConfig } from '../src'
...
const config: RequestConfig = { url }
const response = await new Http.Request<any>(config).execute()
```

### Mode behavior

- _cloud_ : returns response of the external resource (as defined via url/config)
- _connected_ : same as cloud
- _edge_ : same as cloud
- _pure_ : returns local seed data (throws an error if no seed data is available)

### Seed data generation

Use global switch to enable seed data generation while http request:

```javascript
Http.fetchPureSeed = true
...
// do your thing
...
Http.fetchPureSeed = false
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
