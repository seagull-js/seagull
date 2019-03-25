#!/usr/bin/env node
const Ops = require('../dist/src/operators')
new Ops.DevOperator().emit(Ops.StartEvent)
/*
const { Observer } = require('../dist/src/observer')

const options = {
  port: process.env.PORT || 8080,
  dataPath: '.data',
  vendor: ['react', 'react-dom', 'react-helmet', 'lodash', 'typestyle'],
}

new Observer(process.cwd(), options)
  .start()
  .then(() => console.log('started'))
  .catch(error => console.log('error', error))
*/
