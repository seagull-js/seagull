# Work in Progress, DO NOT USE

# Seagull.js

[![npm version](https://badge.fury.io/js/%40seagull-js%2Fseagull.svg)](https://badge.fury.io/js/%40seagull-js%2Fseagull)
[![Build Status](https://travis-ci.org/seagull-js/seagull.svg?branch=master)](https://travis-ci.org/seagull-js/seagull)
[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](http://www.gnu.org/licenses/lgpl-3.0)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

> A Zero-Config Typesafe Isomorphic Cloud Framework.
>
> [See the website](https://seagull-js.github.io/seagull/)

This is the framework core, and not meant to be used standalone for now. There
is an [official CLI tool](https://github.com/seagull-js/seagull-cli) in the
works (seagull-cli), which will do the heavy lifting.

## Roadmap / Milestones:

- [x] design basic framework structure
- [x] set up typescript / tooling
- [x] set up testing framework
- [x] implement classic server logic as abstract lambda api handlers
- [ ] implement data storage as abstract dynamodb models
- [x] choose the ideal frontend framework (~~vue~~, ~~moon••, inferno) and include it