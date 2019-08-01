import {
  BrowserLibraryBundle,
  BrowserPageBundle,
  Bundler,
  NodeAppBundle,
  ServerPageBundle,
} from './bundler'

const bundlerVariants = {
  BrowserLibraryBundle,
  BrowserPageBundle,
  NodeAppBundle,
  ServerPageBundle,
}

type BundlerVariants = keyof typeof bundlerVariants
type VariantOptions<TType extends BundlerVariants> = ConstructorParameters<
  typeof bundlerVariants[TType]
>[0]
interface Args<T extends BundlerVariants = 'NodeAppBundle'> {
  type: T
  config: VariantOptions<T>
  watch: boolean
}

const event = (call: any) => (...args: any[]) => process.send!({ call, args })
const handleBundled = event('handleBundled')
const handleError = event('handleError')
const { config, type, watch }: Args = JSON.parse(process.env.BUNDLER_ARGS!)
const bundlerType = new bundlerVariants[type](config)
const bundler = new Bundler(bundlerType, handleBundled, handleError, watch)
process.on('message', (m: any) => m.call === 'bundle' && bundler.bundle())
