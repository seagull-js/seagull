export interface Options {
  /**
   * if set, this indicates the aws profile that shall be used for deployment
   */
  profile?: string

  /**
   * if set, this indicates the stage, that should be used, default: 'test'
   */
  stage?: string
}
