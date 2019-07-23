# @seagull/build

This package can transform a seagull app `src/` directory into a deployable
application bundle.

## How to Build

Just run `seagull-build` within your seagull application. This should bundle all the pages, routes and serve you a `lambda.js` and a `server.js` file.

## How to run a dev server

Just run `seagull-dev` and a server should start. The port can be configured by the `PORT` env, default is `8080`. Once started, the server should rebuild the pages on the fly.

## How does it work

Basically this whole package defines different steps, that are "wired" within the operators. There are 4 operators:

- The releaseOperator - used for `seagull-build` app and composing the dist directory
- The developmentOperator - serves the dev server, that can be used by `seagull-dev`
- The pageOperator - serves all the pages with the build process
- The lazyPageOperator - will only render pages that have changed

Within the operators you will find a `wiring`, that defines the event loop for the operators and when which event is triggered. Each of these Wirings has an attribute `on` or `once` and and attribute `emit`. `on` will fire **everytime** the event is triggered, `once`, as you might guessed it, only **once**. Emit defines function that is triggered by these.

## Source Folder

The tool will read code from a seagull source code repository (`cwd`) and uses
the following folder paths explicitly:

- `${cwd}/src/pages` - all `*.tsx` files here will be processed as `Route`
- `${cwd}/src/routes` - all `*.ts` files here will be processed as `Page`
- `${cwd}/static` - all files here will be copied as-is to the web root folder

## Destination Folder

This tool will produce the following structure, given a target `folder` path:

- `${folder}/backend` - entry points for different backend environments
  - `${folder}/backend/lambda.js` - when booted on AWS Lambda
  - `${folder}/backend/server.js` - when booted directly as express.js app
- `${folder}/dist/*` - typescript compilation artifacts
- `${folder}/pages` - mirroring of the original /pages structure
  - `${folder}/pages/${pageName}.js` - self-contained UMD-bundle of a Page
- `${folder}/static` - web root for static files, like favicon, ...

### Vendor.js

The web root for static files contains a `vendor.js` file, which bundles global dependencies for pages. The seagull default global dependencies can be altered by adding a new entry to the `package.json` of the seagull project:

````json
{
  ...,
  "vendorBundleIncludes": {
    "add": [
      "someGlobalDependency",
      "somesubDependency/forExample",
      "lodash/isEqual"
    ],
    "remove": [
      "somethingThatShouldBeInAllPages"
    ]
  }
}
````

A relevant case is the inclusion of sub-files of dependencies, like specific `lodash` functions via the following syntax:
````javascript
include isEqual from 'lodash/isEqual'
````
 These are not included by the default seagull global vendor dependencies.