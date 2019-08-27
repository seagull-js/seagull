# seed (fixtures)

> Library implementing seed data generation for test cases.

### Seed data generation

Use global switch to enable seed data generation:

```javascript
import { config } from '@seagull/seed'

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
import { LocalConfig } from '@seagull/seed'

export default <LocalConfig<SomeResponse>>{
  hook: (fixture: SomeResponse) => {
    // do something, e.g. slice some arrays within the fixture
    return fixture
  },
  expiresInDays: 14, // fixture will be re-fetched after 14 days
}

```

A configuration file is applied for all subsequent fixtures.
