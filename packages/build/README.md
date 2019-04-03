# @seagull/build

This package can transform a seagull app `src/` directory into a deployable
application bundle.

## How to Build

- Just run `seagull-build` within your seagull application. This will start the ReleaseOperator.

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
