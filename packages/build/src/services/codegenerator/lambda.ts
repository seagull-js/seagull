export const generate = (appDir: string) => {
  return `
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
  `
}
