import { Options } from './options'
import { Bundler, Cleaner, Compiler, Generator } from './services'

export async function build(appFolder: string, opts: Options) {
  const cleanerService = new Cleaner(appFolder)
  await cleanerService.initialize()
  const compilerService = new Compiler(appFolder)
  await compilerService.initialize()
  const generatorService = new Generator(appFolder)
  await generatorService.initialize()
  const bundlerService = new Bundler(appFolder, opts.vendor)
  await bundlerService.initialize()

  // process all, once.
  await cleanerService.processAll()
  await compilerService.processAll()
  await generatorService.processAll()
  await bundlerService.processAll()
}
