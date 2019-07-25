import { listFilesRecursive } from '@seagull/libraries'
import * as fsModule from 'fs'
import * as path from 'path'

export const listRoutes = (appFolder: string, fs = fsModule) => {
  const srcFolder = routeSourceFolder(appFolder)
  const routeFiles = listFilesRecursive(srcFolder, /tsx?$/, fs)

  return routeFiles.map(f => getRelativeRouteName(appFolder, f))
}
export const listCrons = (appFolder: string, fs = fsModule) => {
  const srcFolder = cronSourceFolder(appFolder)
  const cronFiles = listFilesRecursive(srcFolder, /tsx?$/, fs)

  return cronFiles.map(f => getRelativeCronName(appFolder, f))
}

export const listPages = (appFolder: string, fs = fsModule) => {
  const srcFolder = pagesSourceFolder(appFolder)
  const pageFiles = listFilesRecursive(srcFolder, /tsx?$/, fs)

  return pageFiles.map(f => getRelativePageName(appFolder, f))
}

export const routeSourceFolder = (appFolder: string) =>
  path.join(appFolder, 'src', 'routes')

export const cronSourceFolder = (appFolder: string) =>
  path.join(appFolder, 'src', 'routes', 'cron')

export const pagesSourceFolder = (appFolder: string) =>
  path.join(appFolder, 'src', 'pages')

const getRelativeRouteName = (appFolder: string, filePath: string) => {
  const srcFolder = routeSourceFolder(appFolder)
  return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
}
const getRelativeCronName = (appFolder: string, filePath: string) => {
  const srcFolder = cronSourceFolder(appFolder)
  return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
}
const getRelativePageName = (appFolder: string, filePath: string) => {
  const srcFolder = pagesSourceFolder(appFolder)
  return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
}

const defaultVendorBundleIncludes = [
  'react',
  'react-dom',
  'react-helmet',
  'lodash',
  'typestyle',
]

export const getVendorBundleIncludes = () => {
  try {
    const json = require(`${process.cwd()}/package.json`)
    const includes = json.seagull.vendorBundleIncludes
    if (Array.isArray(includes)) {
      return includes
    }
    const add = includes.add as string[] | undefined
    const remove = includes.remove as string[] | undefined
    const includesSet = new Set<string>(defaultVendorBundleIncludes)
    if (Array.isArray(add)) {
      add.forEach(a => includesSet.add(a))
    }
    if (Array.isArray(remove)) {
      remove.forEach(r => includesSet.delete(r))
    }
    return Array.from(includesSet)
  } catch (e) {
    return defaultVendorBundleIncludes
  }
}
