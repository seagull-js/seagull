import * as fs from 'fs'
import * as mockFS from 'mock-fs'
import * as log from 'npmlog'
import BaseTest from './base_test'

log.level = 'silent'

export default class FunctionalTest extends BaseTest {}
