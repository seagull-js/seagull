import { FS } from '@seagull/mock-fs'
import { Sandbox } from '@seagull/sandbox'

const FSSandbox = new FS('/tmp')
Sandbox.register(FSSandbox)
export { FSSandbox }
