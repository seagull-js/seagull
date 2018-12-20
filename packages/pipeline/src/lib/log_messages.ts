import chalk from 'chalk'

const noCredMessage = `Missing credentials! Please provide a profile. You can refer an existing profile by 'sg deploy --profile <profile>' or by env with AWS_PROFILE. For further information consult https://docs.aws.amazon.com/cli/latest/topic/config-vars.html.`
const noOwnerMessage = `Could not retrieve the owner name of the github repo. Please add a github.com repo to your package.json or write the owner to GITHUB_OWNER`
const noRepoMessage = `Could not retrieve the repository name, will go on with the name in package.json`

export function noCredentialsSet() {
  log(chalk.red(noCredMessage))
}

export function logNoOwnerFound() {
  log(chalk.red(noOwnerMessage))
}

export function logRepoFound() {
  log(chalk.yellow(noRepoMessage))
}

function log(...messages: string[]) {
  // tslint:disable-next-line:no-console
  console.log(...messages)
}
