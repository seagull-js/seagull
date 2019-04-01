import { listFilesRecursive } from '@seagull/libraries'
import * as fsModule from 'fs'
import * as path from 'path'

export const listRoutes = (appFolder: string, fs = fsModule) => {
  const srcFolder = routeSourceFolder(appFolder)
  const routeFiles = listFilesRecursive(srcFolder, /tsx?$/, fs)

  return routeFiles.map(f => getRelativeRouteName(appFolder, f))
}

export const listPages = (appFolder: string, fs = fsModule) => {
  const srcFolder = pagesSourceFolder(appFolder)
  const pageFiles = listFilesRecursive(srcFolder, /tsx?$/, fs)

  return pageFiles.map(f => getRelativePageName(appFolder, f))
}

export const routeSourceFolder = (appFolder: string) =>
  path.join(appFolder, 'src', 'routes')

export const pagesSourceFolder = (appFolder: string) =>
  path.join(appFolder, 'src', 'pages')

const getRelativeRouteName = (appFolder: string, filePath: string) => {
  const srcFolder = routeSourceFolder(appFolder)
  return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
}
const getRelativePageName = (appFolder: string, filePath: string) => {
  const srcFolder = pagesSourceFolder(appFolder)
  return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
}
