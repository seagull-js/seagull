#!/usr/bin/env node

const {
  deploy
} = require('../dist/src/deploy')

const options = {
  profile: process.env.AWS_PROFILE,
}

deploy(process.cwd(), options)
  .then(() => console.log('done'))
  .catch(error => console.log('error', error))