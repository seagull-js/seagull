import * as fs from 'fs'
import * as mockFS from 'mock-fs'
import * as log from 'npmlog'
import BaseTest from './base_test'

log.level = 'silent'

export default class FunctionalTest extends BaseTest {
  mockCredentials = (name: string) => {
    process.env.HOME = '~'
    delete process.env.AWS_PROFILE
    this.mockFolder('~/.aws')
    const lines = [
      `[${name}]`,
      'aws_access_key_id = AKID',
      'aws_secret_access_key = YOUR_SECRET_KEY',
    ]
    fs.writeFileSync('~/.aws/credentials', lines.join('\n'))
  }
}
