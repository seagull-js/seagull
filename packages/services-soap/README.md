# soap (injectable)

> Injectable library for http requests using [soap](https://github.com/vpulim/node-soap).

- Implements seagull environment mode (cloud, connected, edge, pure)
- Implements seed data generation for test cases

### Usage

A soap api function can be called like this:

```javascript
import { SoapClientSupplier, Client } from '@seagull/services-soap'
...

interface HelloClient extends Client {
  sayHelloAsync: (request: MyRequest) => Promise<MyResponse>
}

class ... {
  // inject soap implementation
  constructor(
    private soapClientSupplier: SoapClientSupplier,
  ) {}
  doSomething() {
    try {
      const client = await this.soapClientSupplier.getClient<HelloClient>(
        wsdlURI,
        username,
        password,
        optionalEndpointThatDiffersFromWsdlURI
      )
      const result = await client.sayHelloAsync()
    } catch (err) {
      ...
    }

  }
}
```

For more details, why to use the returned client this way, see
https://www.npmjs.com/package/soap#client-method-asyncargs---call-method-on-the-soap-service

### Bootstrap

```javascript
import { SoapDIModule } from '@seagull/services-soap'
import 'reflect-metadata'
import { Container } from 'inversify'

export const injector = new Container()
injector.load(SoapDIModule)
...
```

### Mode behavior

- _cloud_ : returns response of the external resource (as defined via url/config)
- _connected_ : same as cloud
- _edge_ : same as cloud
- _pure_ : returns local seed data (throws an error if no seed data is available)

### Seed data generation

See `@seagull/seed` README for details.

### Singleton Behavior

When you request a soap client with

```javascript
 await this.soapClientSupplier.getClient(wsdlURI, ...)
```

the real request to the WSDL-URI happens only once under the hood. All future getClient calls with the exact same arguments will deliver the exact same client, without doing network calls
(as long as it doen't throw an error due to unavailability of the WSDL).
