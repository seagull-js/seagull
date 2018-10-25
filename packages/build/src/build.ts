import { FS } from '@seagull/commands'
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { Bundle } from './bundle'
import { Compile } from './compile'
import { Generate } from './generate'
import { Options } from './options'
import { Queue } from './queue'

const vendorDefaults = [
  'react',
  'react-dom',
  'react-helmet',
  'lodash',
  'typestyle',
]

export async function build(appFolder: string, opts: Options) {
  // prepare cleanup steps
  const cleanupQueue = new Queue()
  await prepareCleanupCommands(appFolder, cleanupQueue)
  // prepare compilation steps
  const compileQueue = new Queue()
  await prepareCompileCommands(appFolder, compileQueue)
  // prepare code generation steps
  const generateQueue = new Queue()
  await generateBoilerplate(appFolder, generateQueue)
  // prepare bundling steps
  const bundleQueue = new Queue()
  const packageCache = {}
  await bundleVendor(appFolder, opts, packageCache, bundleQueue)
  await bundleBackend(appFolder, packageCache, bundleQueue)
  await bundlePages(appFolder, opts, bundleQueue, packageCache)

  // process all
  await cleanupQueue.processAll()
  await compileQueue.processAll()
  await generateQueue.processAll()
  await bundleQueue.processAll()
}

async function prepareCleanupCommands(appFolder: string, queue: Queue) {
  const distPath = path.join(appFolder, 'dist')
  queue.register('rimraf', new FS.DeleteFolder(distPath))
  const backendPath = path.join(distPath, 'assets', 'backend')
  queue.register('mkdir-backend', new FS.CreateFolder(backendPath))
  const pagesPath = path.join(distPath, 'assets', 'pages')
  queue.register('mkdir-pages', new FS.CreateFolder(pagesPath))
  const staticFrom = path.join(appFolder, 'static')
  const staticTo = path.join(distPath, 'assets', 'static')
  queue.register('copy-static', new FS.CopyFolder(staticFrom, staticTo))
}

async function prepareCompileCommands(appFolder: string, queue: Queue) {
  const cfg = await readTsconfig(appFolder)
  const srcFolder = path.join(appFolder, 'src')
  const sourceFiles = await new FS.ListFiles(srcFolder, /tsx?$/).execute()
  for (const file of sourceFiles) {
    const from = path.resolve(path.join(file))
    const fragment = path.relative(srcFolder, from).replace(/tsx?$/, 'js')
    const to = path.resolve(path.join(appFolder, 'dist', fragment))
    queue.register(file, new Compile.Typescript(from, to, cfg))
  }
}

async function readTsconfig(appFolder: string) {
  const file = path.resolve(path.join(appFolder, 'tsconfig.json'))
  const exists = await new FS.Exists(file).execute()
  const reader = (filePath: string) => fs.readFileSync(filePath, 'utf-8')
  return exists ? ts.readConfigFile(file, reader).config : undefined
}

async function bundleVendor(
  appFolder: string,
  opts: Options,
  cache: any,
  queue: Queue
) {
  const packages = opts.vendor || vendorDefaults
  const to = path.resolve(path.join(appFolder, 'dist/assets/static/vendor.js'))
  queue.register('vendor', new Bundle.Vendor(packages, to, cache))
}

async function bundleBackend(appFolder: string, cache: any, queue: Queue) {
  const srcFolder = path.join(appFolder, 'src', 'routes')
  queue.register(
    'server.js',
    new Bundle.Backend('dist/index.js', 'dist/assets/backend/server.js', cache)
  )
  queue.register(
    'lambda.js',
    new Bundle.Backend('dist/lambda.js', 'dist/assets/backend/lambda.js', cache)
  )
}

async function generateBoilerplate(appFolder: string, queue: Queue) {
  const srcFolder = path.join(appFolder, 'src', 'routes')
  const files = await new FS.ListFiles(srcFolder, /tsx?$/).execute()
  const extractName = (f: string) =>
    f.replace(srcFolder, '').replace(/\.tsx?$/, '')
  const names = files.map(f => extractName(f))
  queue.register('app.js', new Generate.Express(names, 'dist/app.js'))
  queue.register('server.js', new Generate.Server('dist/index.js'))
  queue.register('lambda.js', new Generate.Lambda('dist/lambda.js'))
}

async function bundlePages(
  appFolder: string,
  opts: Options,
  queue: Queue,
  cache: any
) {
  const packages = opts.vendor || vendorDefaults
  const srcFolder = path.join(appFolder, 'src', 'pages')
  const files = await new FS.ListFiles(srcFolder, /\.tsx?$/).execute()
  for (const file of files) {
    const relative = path.relative(srcFolder, file).replace(/tsx?$/, 'js')
    const from = `dist/pages/${relative}`
    const to = `dist/assets/pages/${relative}`
    queue.register(file, new Bundle.Page(from, to, cache, packages))
  }
}
