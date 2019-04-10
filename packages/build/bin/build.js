#!/usr/bin/env node

const helpText = `
  --mode edge|connected         # Sets MODE
  --stage test|prod             # ... not supported right now
  --compatible false            # Sets Babel transform
  --optimize-runtime true|false   # Sets NODE_ENV to production
  --optimize-bundle false       # Minimize, dead code elimination etc.
  --type-check false            # Transpile only?
  -h                            # show this
`

if (process.argv.join().includes('-h')) {
  console.info(helpText)
  process.exit(0)
}

function getArgv(setting, def) {
  const index = process.argv.indexOf(setting) + 1
  const v = index !== 0 ? process.argv[index] : def
  return v === 'true' || v === 'false' ? v === 'true' : v
}

const opts = {
  mode: getArgv('--mode', process.env.MODE),
  stage: getArgv('--stage', process.env.STAGE),
  compatible: getArgv('--compatible', false),
  optimizeRuntime: getArgv('--optimize-runtime', false),
  optimizeBundle: getArgv('--optimize-bundle', false),
  typeCheck: getArgv('--type-check', true),
}

opts.mode ? (process.env.MODE = opts.mode) : null
process.env.STAGE = opts.stage
process.env.NODE_ENV = opts.optimizeRuntime ? 'production' : 'development'

const Ops = require('../dist/src/operators')
const op = new Ops.ReleaseOperator(opts)
op.on(Ops.ReleaseOperator.DoneEvent, () => process.exit(0))
op.emit(Ops.StartEvent)
