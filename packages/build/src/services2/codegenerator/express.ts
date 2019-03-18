import { listFilesRecursive } from '@seagull/libraries'
import * as fsModule from 'fs'
import * as path from 'path'

export const generate = (appFolder: string, fs = fsModule) => {
  const srcFolder = routeSourceFolder(appFolder)
  const routeFiles = listFilesRecursive(srcFolder, /tsx?$/, fs)

  const routes = routeFiles.map(f => getRelativeRouteName(appFolder, f))
  const content = [...header, ...body(routes), ...footer].join('\n')
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
  const absPath = (r: string) => path.join('./routes', r)
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

const getRelativeRouteName = (appFolder: string, filePath: string) => {
  const srcFolder = routeSourceFolder(appFolder)
  return filePath.replace(srcFolder, '').replace(/\.tsx?$/, '')
}

const routeSourceFolder = (appFolder: string) =>
  path.join(appFolder, 'src', 'routes')
