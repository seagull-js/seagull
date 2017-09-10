---
layout: default
title:  "Documentation: package.json"
---

# {{ page.title }}

Instead of inventing just another configuration file / format, Seagull leverages
the already existing package.json file for node.js projects. See an example
[here](https://github.com/seagull-js/seagull-cli/blob/master/templates/app/package.json)
from the Seagull CLI scaffolding template.

## Used Fields from original package.json

Currently, only the `"name"` field is used from the package.json file. When
deploying to AWS later on, all your stuff will get prefixed with the app name.

## Seagull-specific fields in package.json

There are no special fields as of now. This may change soon.