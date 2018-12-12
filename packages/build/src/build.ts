import { Options } from './options'
import { Bundler, Cleaner, Compiler, Generator } from './services'

export async function build(appFolder: string, opts: Options) {
  const cleaner = await Cleaner.create(appFolder)
  const compiler = await Compiler.create(appFolder)
  const generator = await Generator.create(appFolder)
  const bundler = await Bundler.create(appFolder, opts.vendor)

  // process all, once.
  await cleaner.processAll()
  await compiler.processAll()
  await generator.processAll()
  await bundler.processAll()
}
