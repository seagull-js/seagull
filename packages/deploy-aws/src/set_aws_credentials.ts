import { config, SharedIniFileCredentials } from 'aws-sdk'

export function setCredsByProfile(profile: string) {
  /**
   * basically the filename is just used for testing, but could be convenient for users, too
   */
  const filename = process.env.AWS_SHARED_CREDENTIALS_FILE
  const creds = new SharedIniFileCredentials({ filename, profile })
  const areValidCreds = creds.accessKeyId && creds.secretAccessKey
  return areValidCreds ? writeCreds(creds, profile) : false
}

function writeCreds(creds: SharedIniFileCredentials, profile: string) {
  config.credentials = creds
  process.env.AWS_PROFILE = profile
  return true
}
