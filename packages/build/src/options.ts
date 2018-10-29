export interface Options {
  /**
   * port for the dev server, defaults to 8080
   */
  port?: number

  /**
   * list of package names classified as "vendor", such as "react"
   */
  vendor?: string[]
}
