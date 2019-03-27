# CHANGE LOG

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
