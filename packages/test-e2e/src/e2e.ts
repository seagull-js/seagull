import * as cucumber from 'cucumber'
const stdout = process.stdout
const cwd = process.cwd()

export const e2e = async () => {
  const argv = [
    'cucumber',
    '--require-module',
    'ts-node/register',
    "--require 'step-definitions/**/*.ts'",
    './',
  ]
  const cli = new (cucumber as any).Cli({ argv, cwd, stdout })
  await cli.run()
}
