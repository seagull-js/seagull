// tslint:disable-next-line:variable-name
export const generate = (_appDir: string) => {
  return `
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  const app_1 = require("./app");
  app_1.default.listen(8080, () => {
      console.log('started');
  });
  `
}
