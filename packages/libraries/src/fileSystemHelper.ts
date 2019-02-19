import * as fs from 'fs'

export function createFolderRecursive(folderPath: string, fsModule = fs) {
  const segments = folderPath.split('/').filter(c => c!!)
  const creator = (p: string, f: string) => createFolderInPath(p, f, fsModule)
  segments.reduce(creator, '/')
}

export function getCurrentWorkingDirectoryFolder() {
  return (
    (process
      .cwd()
      .split('/')
      .pop() as string) || 'unknown'
  )
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
