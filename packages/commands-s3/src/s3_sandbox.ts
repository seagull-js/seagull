import { S3MockMem } from '@seagull/mock-s3'
import { Sandbox } from '@seagull/sandbox'

const S3Sandbox = new S3MockMem()
Sandbox.register(S3Sandbox)

export { S3Sandbox }
