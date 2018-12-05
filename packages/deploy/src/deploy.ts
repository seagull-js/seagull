import { FS } from '@seagull/commands'
import {
  bootstrapEnvironment,
  deployStack,
  loadToolkitInfo,
  SDK,
} from 'aws-cdk'
import chalk from 'chalk'

import { ProjectApp } from './cdk_stack'
import { ProfileCheck } from './commands/check_profile'
import { Options } from './options'

export async function deploy(appFolder: string, opts: Options) {
  const credCheck = new ProfileCheck(opts.profile)
  return credCheck.execute() ? deployApp(appFolder, opts.profile) : noCreds()
}

async function deployApp(appFolder: string, profile?: string) {
  const pkgJson = require(`${appFolder}/package.json`)
  const projectName = pkgJson.name
  const sdk = await new SDK({})
  const accountID = (await sdk.defaultAccount()) || ''
  const region = process.env.AWS_REGION || 'eu-central-1'
  provideAssetFolder(appFolder)
  const app = new ProjectApp(projectName, accountID, region || '', appFolder)
  const stack = app.synthesizeStack(projectName)

  const toolkit = await loadToolkitInfo(stack.environment, sdk, 'CDKToolkit')
  await bootstrapEnvironment(stack.environment, sdk, 'CDKToolkit', undefined)
  await deployStack({ sdk, stack, toolkitInfo: toolkit })
}

function noCreds() {
  // tslint:disable-next-line:no-console
  console.log(
    chalk.red(`Missing credentials!        
  Please provide fitting aws credentials. You can refer an existing profile by 
  'sg deploy --profile <profile>' or by env variables. For further information 
  consult https://docs.aws.amazon.com/cli/latest/topic/config-vars.html.`)
  )
}

function provideAssetFolder(appFolder: string) {
  const assetPath = `${appFolder}/dist/assets`
  const deployFolder = `${appFolder}/.seagull/deploy`
  const newAssetPath = `${deployFolder}/assets`
  const serverJsPath = `${newAssetPath}/backend/server.js`
  const folderExists = new FS.Exists(newAssetPath).execute()
  const createFolder = new FS.CreateFolder(deployFolder)
  const deleteFolder = new FS.DeleteFolder(newAssetPath)
  folderExists ? deleteFolder.execute() : createFolder.execute()
  new FS.CopyFolder(assetPath, newAssetPath).execute()
  new FS.DeleteFile(serverJsPath).execute()
}
