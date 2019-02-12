import * as cucumber from 'cucumber'
import { existsSync } from 'fs'
import { join } from 'path'
const stdout = process.stdout
const cwd = process.cwd()

const flatMap = <T, F extends (i: T) => any[]>(collection: T[], func: F) =>
  collection.map(func).reduce((acc, cv) => acc.concat(cv))

const tsModule = ['--require-module', 'ts-node/register']
const projectWorldPath = join(process.cwd(), './features/support/world.ts')
const usedWorldPath = existsSync(projectWorldPath)
  ? projectWorldPath
  : require.resolve('./world')
const stepsPath = './features/step-definitions/**/*.ts'

const requirePaths = [stepsPath, usedWorldPath]
const requireArgs = flatMap(requirePaths, i => ['--require', i])

export const e2e = async () => {
  const bin = './cucumber'
  const featurePath = './features/*.feature'
  const argv = [bin, ...tsModule, ...requireArgs, featurePath]
  const cli = new (cucumber as any).Cli({ argv, cwd, stdout })
  const result = await cli.run()
  return result.success
}
