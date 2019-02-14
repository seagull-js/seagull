import * as cucumber from 'cucumber'
import { existsSync } from 'fs'
import { flatMap } from 'lodash'
import { join } from 'path'

// constants we need
const cwd = process.cwd()

// cucumber should be able to load ts files
const tsModule = ['--require-module', 'ts-node/register']

// path where world.ts should exist in user project (if override is wanted)
const projectWorldPath = join(process.cwd(), './features/support/world.ts')
// determine which world.ts should be used
const usedWorldPath = existsSync(projectWorldPath)
  ? projectWorldPath
  : require.resolve('./world')
// path cucumber step definitions will be in
const stepsPath = join(cwd, './features/step-definitions/**/*.ts')
// path cucumber feature definitions will be in
const featurePath = './features/*.feature'
// extra recquires for the cucumber cli tool
const requireArgs = flatMap([stepsPath, usedWorldPath], i => ['--require', i])

/* 
  cucumber e2e test runner using zombie js
  wraps the cucumber cli for more flexibility
  - Put your features in ./features
  - Step definitions must be written in typescript and should be placed in
    ./features/step-definitions/** /*.ts
  - If you want to override the world create ./features/support/world.ts
*/
export const e2e = async ({ stdout } = { stdout: process.stdout }) => {
  const bin = './cucumber'
  const argv = [bin, ...tsModule, ...requireArgs, featurePath]
  const cli = new (cucumber as any).Cli({ argv, cwd, stdout })
  const result = await cli.run()
  return result.success
}
