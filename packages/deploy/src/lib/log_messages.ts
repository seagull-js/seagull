import chalk from 'chalk'

const noCredMessage = `Missing credentials! Please provide a profile. You can refer an existing profile by 'sg deploy --profile <profile>' or by env with AWS_PROFILE. For further information consult https://docs.aws.amazon.com/cli/latest/topic/config-vars.html.`

export function noCredentialsSet() {
  log(chalk.red(noCredMessage))
}

function log(...messages: string[]) {
  // tslint:disable-next-line:no-console
  console.log(messages)
}
