import chalk from 'chalk'

const noCredMessage = `Missing credentials! Please provide a profile. You can refer an existing profile by 'sg deploy --profile <profile>' or by env with AWS_PROFILE. For further information consult https://docs.aws.amazon.com/cli/latest/topic/config-vars.html.`
const noAssetsMessage = `Cannot find the directory 'dist/assets' within the folder. Forgot sg build?`
const noRevertAssetMessage = `Cannot revert asset folder, because it is not implemented yet.`
const noChangesInDiffMessage = `No changes were to the infrastructure template`
const noValidationMessage = `Validation was disabled, will see if it works`
const noS3DeplyomentMessage = `No S3 bucket will be deployed`
const noOwnerMessage = `Could not retrieve the owner name of the github repo. Please add a github.com repo to your package.json or write the owner to GITHUB_OWNER`
const noRepoMessage = `Could not retrieve the repository name, will go on with the name in package.json`
const noGitRepo = `Could not retrieve repository name, which is essential for the pipeline! Add it in your package.json or via GITHUB_REPO in env.`
const noGithubToken = `Could not retrieve github token. Will not be able to retrieve code base from there`

export function noOwnerFound() {
  log(chalk.red(noOwnerMessage))
}

export function noGitRepoFound() {
  log(chalk.red(noGitRepo))
}

export function noGithubTokenFound() {
  log(chalk.red(noGithubToken))
}

export function repoFound() {
  log(chalk.yellow(noRepoMessage))
}

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

export function noValidation() {
  log(chalk.yellow(noValidationMessage))
}

export function noS3Deploy() {
  log(chalk.yellow(noS3DeplyomentMessage))
}

function log(...messages: string[]) {
  // tslint:disable-next-line:no-console
  console.log(...messages)
}
