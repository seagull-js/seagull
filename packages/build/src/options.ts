export interface Options {
  /**
   * if set to a file path, synchronize local data (like S3 shim) to disk at
   * this location
   */
  dataPath?: string

  /**
   * port for the dev server, defaults to 8080
   */
  port?: number

  /**
   * list of package names classified as "vendor", such as "react"
   */
  vendor?: string[]
}
