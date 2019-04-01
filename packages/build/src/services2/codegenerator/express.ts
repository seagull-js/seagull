import * as fsModule from 'fs'
import * as path from 'path'
import * as project from '../../lib/project'

export const generate = (appFolder: string, fs = fsModule) => {
  const routes = project.listRoutes(appFolder, fs)
  const content = [...header, body(routes), ...footer].join('\n')
  return content
}

// general initialization of the app object
const header = [
  'Object.defineProperty(exports, "__esModule", { value: true });',
  'const express = require("express");',
  `const morgan = require('morgan');`,
  `const SGRoutes = require('@seagull/routes');`,
  'const bodyParser = require("body-parser");',
  'const app = express();',
  `app.use(morgan('combined'));`,
  'app.use(bodyParser.urlencoded({ extended: true }));',
  'app.use(bodyParser.json());',
  'app.use(express.static(`${process.cwd()}/dist/assets/static`));',
  `const registerRoute = (route) => {
        try { route.register(app) }
        catch(error) { console.log('error registering route:', route, error) }
      }`,
]

const body = (routes: string[]) => {
  const absPath = path.join.bind(null, './routes')
  const requireRoute = (routePath: string) => `
      (() => {
        try { 
          const route = require("./${absPath(routePath)}").default;
          if(!SGRoutes.routeIsValid(route)){
            throw new Error('Route not valid')
          }
          return route
        }
        catch (error) {
          console.log('error loading route:','./${absPath(routePath)}', error);
        }
      })(),
      `
  const requiredRoutes = routes.map(requireRoute)
  return `const routes = [${requiredRoutes}].filter(v=>!!v).sort(SGRoutes.routeSort);`
}

const footer = ['routes.map(registerRoute);', 'exports.default = app;']
