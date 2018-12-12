import { Command, FS } from '@seagull/commands'

export class Lambda extends Command {
  /** where to write a bundle file to */
  dstFile: string

  constructor(dstFile: string) {
    super()
    this.dstFile = dstFile
  }

  async execute() {
    const content = code
    await new FS.WriteFile(this.dstFile, content).execute()
  }

  async revert() {
    await new FS.DeleteFile(this.dstFile).execute()
  }
}

const code = `
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serverless = require("serverless-http");
const app_1 = require("./app");
module.exports.handler = serverless(app_1.default, {
    binary: ['image/*'],
    request: (request, event, context) => {
        console.log(request);
    },
    response: (response, event, context) => {
        console.log(response);
    },
});
function config(stage) {
    const integration = 'lambda-proxy';
    const method = 'ANY';
    const http1 = { integration, method, path: '/', private: false };
    const http2 = { integration, method, path: '/{any+}', private: false };
    return {
        description: 'universal route',
        events: [{ http: http1 }, { http: http2 }],
        handler: 'dist/assets/backend/lambda.handler',
        name: \`helloworld-\${stage}-handler\`,
        tags: { service: 'helloworld' },
    };
}
exports.test = () => config('test');
exports.prod = () => config('prod');
`
