/** @module Scaffold */
export const TsConfig = {
  compilerOptions: {
    module: 'commonjs',
    skipLibCheck: true,
    target: 'es5',
    removeComments: true,
    sourceMap: true,
    declaration: true,
    outDir: '.seagull/dist',
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
    lib: ['es5', 'es6', 'es7', 'dom', 'dom.iterable'],
    jsx: 'react',
    rootDirs: ['backend', 'frontend', 'lib'],
    strict: true,
  },
  types: ['node'],
  typeRoots: ['node_modules/@types'],
}
