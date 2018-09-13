// /** @module Deploy */
import * as fs from 'fs'
import { join } from 'path'
import * as YAML from 'yamljs'
import { Account, Template } from '../../infrastructure/aws'
import { writeFile } from '../../tools/util'
import { DeployCommand } from '../deploy'

// /**
//  *
//  */
export class DeployToAWS extends DeployCommand {
  //   /**
  //    *
  //    */
  //   // constructor(srcFolder: string) {
  //   //   super(srcFolder)
  //   // }

  //   /**
  //    *
  //    */
  async execute() {
    const account = new Account() // TODO: read profile name from env
    const accountId = await account.getAccountId()
    const config = this.readPackageJson()
    const template = new Template(config.name, config.description, accountId)
    const json = JSON.parse(JSON.stringify(template)) //  remove undefined stuff
    const slsFileContent = YAML.stringify(json, 42, 2)
    const slsFilePath = join(this.srcFolder, '.seagull', 'serverless.yml')
    writeFile(slsFilePath, slsFileContent)
  }

  private readPackageJson() {
    const path = join(this.srcFolder, 'package.json')
    const content = fs.readFileSync(path, 'utf-8')
    return JSON.parse(content)
  }
}
