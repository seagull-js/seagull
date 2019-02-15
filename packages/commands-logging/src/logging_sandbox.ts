import { CWLMockMem } from '@seagull/mock-cloudwatchlogs'
import { Sandbox } from '@seagull/sandbox'

const CWLSandbox = new CWLMockMem()
Sandbox.register(CWLSandbox)

export { CWLSandbox }
