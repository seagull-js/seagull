export type Environments =
  // Self contained, cloud-less runtime like edge computing or dev server
  | 'edge'
  // self contained, cloud-less runtime but resets each time. e.g. tests with no side effects and mocked services
  | 'pure'
  // cloud runtime, uses real aws services, always online
  | 'cloud'
  // does not run in aws cloud but uses real aws services, sync for edge computing or debugging on dev server with real data scenarios
  | 'connected'

export type IMode = {
  environment: Environments
}

/**
 * Module based singleton containing the configured truth of modes
 */
export const Mode: Readonly<IMode> = {
  environment: 'edge' as Environments,
}
