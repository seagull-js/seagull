/**
 * Local config for local seed creation/update modifications.
 */
export interface SeedLocalConfig<T> {
  hook?: (fixture: T) => T
  expiresInDays?: number
}
