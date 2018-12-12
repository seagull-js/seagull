# Contributing to the Seagull Framework

This is a monorepo for the Seagull Framework and contains multiple npm packages.
Organization of dependencies, versioning and publishing is managed by
[lerna.js](https://lernajs.io/).

## Getting started

After cloning this repository, install _all_ dependencies with the command
`npm run bootstrap`. This will take care of installing third party stuff of
all seagull packages at once, re-using things as much as possible. Seagull
packages will be symlinked across each other as needed.

**Do not run `npm install` within an individual package folder!**

## Running all tests

Every package has an exhaustive test suite implemented with
[mocha](https://mochajs.org/) and [chai](https://www.chaijs.com/) and can be
run globally across all packages with `npm run test`. There is also
[tslint](https://palantir.github.io/tslint/) with exact configurations enforced
through all packages to ensure a consistent code style guide.

## Deploying Changes

TODO: currently a manual process, will be CI-driven trough travis in the future.
