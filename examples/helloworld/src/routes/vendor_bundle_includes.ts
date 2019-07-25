import { Route, RouteContext } from '@seagull/routes'

export default class VendorBundleIncludesRoute extends Route {
  static path = '/vendor-bundle-includes'
  static async handler(this: RouteContext) {
    this.render('VendorBundleIncludes', { name: 'John' })
  }
}
