import { FS, Service } from '@seagull/commands'
import * as path from 'path'
import { Bundle } from '../bundle'

export class Bundler extends Service {
  /**
   * reference to where the app code resides in
   */
  appFolder: string

  /**
   * external module cache for browserify-incremental
   */
  pkgCache: any = {}

  vendor: string[] = [
    'react',
    'react-dom',
    'react-helmet',
    'lodash',
    'typestyle',
  ]

  constructor(appFolder: string, vendor?: string[]) {
    super()
    this.appFolder = appFolder
    this.vendor = vendor || this.vendor
  }

  async initialize() {
    this.registerVendorBundling()
    this.registerBackendBundling()
    const files = await this.listPageSourceFiles()
    files.forEach(f => this.registerPage(f))
  }

  async processPages() {
    const ignoredKeys = ['vendor.js', 'lambda.js', 'backend.js']
    return await this.processWithout(ignoredKeys)
  }

  registerPage(sourcePath: string) {
    const srcFolder = path.join(this.appFolder, 'src', 'pages')
    const relative = path.relative(srcFolder, sourcePath.replace(/tsx?$/, 'js'))
    const from = path.join(this.appFolder, 'dist', 'pages', relative)
    const to = path.join(this.appFolder, 'dist', 'assets', 'pages', relative)
    const command = new Bundle.Page(from, to, this.pkgCache, this.vendor)
    this.register(sourcePath, command)
  }

  private registerVendorBundling(name: string = 'vendor.js') {
    const to = path.join(this.appFolder, 'dist/assets/static/vendor.js')
    this.register(name, new Bundle.Vendor(this.vendor, to, this.pkgCache))
  }

  private registerBackendBundling(server = 'backend.js', lambda = 'lambda.js') {
    const dist = path.join(this.appFolder, 'dist')
    const serverFrom = path.join(dist, 'server.js')
    const serverTo = path.join(dist, 'assets', 'backend', 'server.js')
    this.register(server, new Bundle.Backend(serverFrom, serverTo))
    const lambdaFrom = path.join(dist, 'lambda.js')
    const lambdaTo = path.join(dist, 'assets', 'backend', 'lambda.js')
    this.register(lambda, new Bundle.Backend(lambdaFrom, lambdaTo))
  }

  private async listPageSourceFiles() {
    const srcFolder = path.join(this.appFolder, 'src', 'pages')
    return await new FS.ListFiles(srcFolder, /\.tsx?$/).execute()
  }
}
