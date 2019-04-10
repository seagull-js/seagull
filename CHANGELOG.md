# CHANGE LOG

## NEXT

### Breaking Changes

### Minor Changes

### Patch Changes

##

- @seagull/build -> Dev / Build Server rewrite
  See `npm run dev -- -h` or `npm run build` -- -h for options
  Migration:

1. Add a tsconfig.build.json like in `examples/helloworld`
2. DONT import things outside the `src` folder in the `src` folder
3. Fix all your Types.

npm run build might not work if you set NODE_ENV to something other than `development` or `production`

## 6.0.0 - 2019-04-09

- @seagull/deploy-aws -> added function to destroy a stack

## 5.0.0 - 2019-04-08

- @seagull/deploy -> remove package, because deploy-aws does it's job now
- @seagull/pipeline -> remove package, because deploy-aws does it's job now
- @seagull/deploy-aws -> cloudwatch logs are not retained anymore, when stack is destroyed

## 4.0.0 - 2019-04-05

- @seagull/all -> Service is now CommandService, Injectables (noname) are now services
- @seagull/services-http -> http (noname) injectable is now http-service
- @seagull/services-s3 -> new S3 service with writeFiles function to add multiple files at once

## 3.4.1 - 2019-04-04

- @seagull/deploy-aws -> fixed missing flag for compression in cloudfront
- @seagull/deploy-aws -> cloudfront uses gzip now correctly
- @seagull/deploy-aws -> bug fix in pipeline, where a dying e2e test leads to the github details will not give the cloudfront url, but the pipeline url.
- @seagull/all -> harmonized seagull package version numbers

## 3.4.1 - 2019-04-02

- @seagull/deploy-aws -> fixed missing flag for compression in cloudfront
- @seagull/all -> harmonized seagull package version numbers

## 3.4.0 - 2019-04-02

- @seagull/deploy-aws -> added feature to modify deploy stack within an app
- @seagull/deploy-aws -> fixed a bug, where the AWS_REGIOn was not set to process.env
- @seagull/deploy-aws -> added feature, where env variables can be set via a file name .env.test or .env.prod according to the deploy mode
- @seagull/deploy-aws -> set node_env in lambda env to deploy_mode

## 3.3.0 - 2019-04-02

- @seagull/commands-logging -> improved logging + added example to helloworld
- @seagull/mock-cloudwatchlogs -> adjust mock to addLog function
- @seagull/libraries -> added helper functions for frontend logging

## 3.2.0 - 2019-03-29

- @seagull/deploy-aws -> api gateway defines it's stage by the mode it is called in.
- @seagull/deploy-aws -> infrastructure customizable by infrastructure-aws.ts in project directory (top level)

## 3.1.1 - 2019-03-27

- @seagull/deploy-aws -> bug fixes for e2e tests
- @seagull/e2e -> crashing tests are aborting the pipeline now

## 3.1.0 - 2019-03-27

- @seagull/all -> when packages throw an error, they handle them as an error and crash
- @seagull/deploy-aws -> after deployment the e2e tests are executed
- @seagull/pages -> added typestyle-ssr-fix

## 3.0.7 - 2019-03-25

- @seagull/all -> updated security vulnerability
- @seagull/soap -> minor bugfix, uppercase error in imported class
- @seagull/deploy-aws -> minor bugfix, where non existing cron-file aborts the deployment
- @seagull/deploy-aws -> minor bugfix, where the region was not set to env

## 3.0.6 - 2019-03-25

- @seagull/deploy-aws -> added e2e test to deploy process
