import { DeployToAWS } from './aws'
import { DeployToFolder } from './folder'

export async function strategy(srcFolder: string, name: string) {
  if (name === 'folder') {
    return new DeployToFolder(srcFolder).run()
  }
  if (name === 'aws') {
    return new DeployToAWS(srcFolder).run()
  }
}
