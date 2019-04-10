import * as fsModule from 'fs'
import * as path from 'path'

export const generate = (lazy = false) => content(lazy)

// general initialization of the app object
const content = (lazy = false) => `
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const morgan = require('morgan');
const SGRoutes = require('@seagull/routes');
const {listFilesRecursive} = require('@seagull/libraries');
const {join} = require('path');
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(join(process.cwd(),'static')));
app.use(express.static(\`${process.cwd()}/dist/assets/static\`));

${lazy && appProxy}

const routeFolder = join(process.cwd(),'src','routes')
const registerRoute = (route) => {
  try { route.register(${lazy ? 'wrappedApp' : 'app'}) }
  catch(error) { console.log('error registering route:', route, error) }
}

const requireRoute = (routePath)=>{
  const relRoutePath = routePath.replace(routeFolder, '').replace(/\.tsx?$/, '')
  try { 
    const rPath = join(process.cwd(),'dist','routes',relRoutePath)
    const route = require(rPath).default;
    if(!SGRoutes.routeIsValid(route)){
      throw new Error('Route not valid');
    }
    return route
  }
  catch (error) {
    console.log('error loading route:', routePath, error);
    exit(1);
  }
}

const routeFiles = listFilesRecursive(routeFolder, /tsx?$/)

const routes = routeFiles
  .map(requireRoute)
  .filter(v=>!!v)
  .sort(SGRoutes.routeSort);
routes.map(registerRoute);
exports.default = app;
const port = process.env.PORT || 8080 
app.listen(port,()=>console.log("Started"))`

const appProxy = `
const pagePromise = (page) => (resolve, reject) => {
  const cancelTimeout = setTimeout(()=>reject('Timeout for ' + page), 20000)
  process.send({'type':'pageRenderRequested', 'page':page})
  process.once('message', (m)=>{
    if (!(m && m.type && m.type === 'pageBundled' && m.page === page)) {
      return
    }
    clearTimeout(cancelTimeout)
    resolve()
  })
}
class LazyRouteContext extends SGRoutes.RouteContext {

  async render(src, data) {
    const pagePath = join(process.cwd(),'/dist/assets/pages/',src+'.js')
    const waitForPage = fs.existsSync(pagePath) 
      ? Promise.resolve() 
      : new Promise(pagePromise(src))
    try {
      await waitForPage
      super.render(src,data)
    } catch (e) {
      console.error(e)
      this.error('Rendering not successfull')
    }
  }
}

const wrapRouteHandler = (handler) => (req,res) =>
  handler(new LazyRouteContext(req,res))
const wrapAppRegister = (register) => (path, handler) =>
  register(path, wrapRouteHandler(handler))

const appProxyHandler = {
  get: (target, prop) =>  wrapAppRegister(target[prop].bind(target))
}
const wrappedApp = new Proxy(app, appProxyHandler)
`
