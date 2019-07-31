/**
 * Local config for local seed creation/update modifications.
 */
export interface LocalConfig<T> {
  hook?: (fixture: T) => T
  expiresInDays?: number
}
