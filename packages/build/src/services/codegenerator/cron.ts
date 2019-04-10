import * as fsModule from 'fs'
import * as path from 'path'
import * as project from '../../lib/project'

export const generate = (appFolder: string, fs = fsModule) => {
  const crons = project.listCrons(appFolder, fs)
  const content = crons.map(buildCronInfos).filter(r => !!r)
  return JSON.stringify(content)
}

const buildCronInfos = (cron: string) => {
  const cronDistPath = path.join(process.cwd(), 'dist', 'routes', 'cron')
  const cronRoute = require(path.join(cronDistPath, cron)).default
  return cronRoute ? { path: cronRoute.path, cron: cronRoute.cron } : undefined
}
