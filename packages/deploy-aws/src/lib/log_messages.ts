import chalk from 'chalk'

const noCredMessage = `Missing credentials! Please provide a profile. You can refer an existing profile by 'sg deploy --profile <profile>' or by env with AWS_PROFILE. For further information consult https://docs.aws.amazon.com/cli/latest/topic/config-vars.html.`
const noAssetsMessage = `Cannot find the directory 'dist/assets' within the folder. Forgot sg build?`
const noRevertAssetMessage = `Cannot revert asset folder, because it is not implemented yet.`
const noChangesInDiffMessage = `No changes were to the infrastructure template`
const noCheckProfileMessage = `Profile check was disabled, this may crash.`

export function noCredentialsSet() {
  log(chalk.red(noCredMessage))
}

export function noAssetsFound() {
  log(chalk.red(noAssetsMessage))
}

export function cannotRevertAssetFolder() {
  log(chalk.yellow(noRevertAssetMessage))
}

export function noChangesInDiff() {
  log(chalk.green(noChangesInDiffMessage))
}

export function noCheckProfile() {
  log(chalk.yellow(noCheckProfileMessage))
}

function log(...messages: string[]) {
  // tslint:disable-next-line:no-console
  console.log(...messages)
}
