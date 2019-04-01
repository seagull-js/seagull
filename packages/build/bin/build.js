#!/usr/bin/env node
const Ops = require('../dist/src/operators')
new Ops.ReleaseOperator().emit(Ops.StartEvent)
