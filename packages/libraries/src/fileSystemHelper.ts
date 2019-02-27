import * as fs from 'fs'

export function createFolderRecursive(folderPath: string, fsModule = fs) {
  const segments = folderPath.split('/').filter(c => c!!)
  const creator = (p: string, f: string) => createFolderInPath(p, f, fsModule)
  segments.reduce(creator, '/')
}

export function getAppName() {
  try {
    const packageFile = require(`${process.cwd()}/package.json`)
    if (packageFile) {
      return packageFile.name
    }
  } catch (e) {
    // no file found
  }

  const appName = process.env.APP

  if (appName) {
    return appName
  } else {
    throw new Error('NO APP NAME GIVEN')
  }
}

const createFolderInPath = (
  pathForFolder: string,
  folderName: string,
  fsModule = fs
) => {
  const newPath = `${pathForFolder}/${folderName}/`
  try {
    fsModule.mkdirSync(newPath)
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e
    }
  }
  return newPath
}
