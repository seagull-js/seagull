# soap (injectable)

> A thin wrapper around the [soap]-Library (https://github.com/vpulim/node-soap).

- Implements a(n) (injectable) SoapClientSupplier (using inversifyJS)
- Exports all other stuff from [soap]-Package

### Usage

Basically you can use the SoapClientSupplier like this:

```javascript
import { SoapClientSupplier, Client } from '@seagull/services-soap'
...

type MyResponseArray = [{ return: MyResponse }, string, object, string]
interface HelloClient extends Client {
  sayHelloAsync: (request: MyRequest) => Promise<MyResponseArray>
}

class ... {
  // inject soap implementation
  constructor(
    private soapClientSupplier: SoapClientSupplier,
  ) {}
  doSomething() {
    try {
      ...
      const client = await this.soapClientSupplier.getClient<HelloClient>(
        wsdlURI,
        username,
        password,
        optionalEndpointThatDiffersFromWsdlURI
      )
      const [result, rawResponseString, soapheader, rawRequestString] =
        await client.sayHelloAsync()
    } catch (err) {
      ...
    }

  }
}
```

For more details, why to use the returned client this way, see
https://www.npmjs.com/package/soap#client-method-asyncargs---call-method-on-the-soap-service

If you don't want to use it - you can implement your own Soap Client by the exported [soap]-Library

### Bootstrap

```javascript
import { SoapDIModule } from '@seagull/services-soap'
import 'reflect-metadata'
import { Container } from 'inversify'

export const injector = new Container()
injector.load(SoapDIModule)
...
```

### Singleton Behavior

When you request a soap client with

```javascript
 await this.soapClientSupplier.getClient(wsdlURI, ...)
```

the real request to the WSDL-URI happens only once under the hood. All future getClient calls with the exact same arguments will deliver the exact same client, without doing network calls
(as long as it doen't throw an error due to unavailability of the WSDL).
