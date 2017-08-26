import Builder from './builder'

export interface IGenerateOpts {
  name: string
}

export default function generate(opts: IGenerateOpts): string {
  return new Builder(opts.name).toYAML()
}
