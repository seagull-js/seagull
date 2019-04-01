#!/usr/bin/env node
const Ops = require('../dist/src/operators')
new Ops.DevOperator().emit(Ops.StartEvent)
