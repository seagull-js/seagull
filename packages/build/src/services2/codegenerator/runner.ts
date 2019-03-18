import * as fsModule from 'fs'
import * as path from 'path'

export const generate = (appFolder: string, fs = fsModule) => {
  return content
}

// general initialization of the app object
const content = `
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const morgan = require('morgan');
const SGRoutes = require('@seagull/routes');
const {listFilesRecursive} = require('@seagull/libraries');
const {join} = require('path');
const bodyParser = require("body-parser");
const app = express();
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(join(process.cwd(),'static')));

const routeFolder = join(process.cwd(),'src','routes')
const registerRoute = (route) => {
  try { route.register(app) }
  catch(error) { console.log('error registering route:', route, error) }
}

const requireRoute = (routePath)=>{
  const relRoutePath = routePath.replace(routeFolder, '').replace(/\.tsx?$/, '')
  try { 
    const rPath = join(process.cwd(),'dist','routes',relRoutePath)
    const route = require(rPath).default;
    if(!SGRoutes.routeIsValid(route)){
      throw new Error('Route not valid')
    }
    return route
  }
  catch (error) {
    console.log('error loading route:', routePath, error);
  }
}

const routeFiles = listFilesRecursive(routeFolder, /tsx?$/)

const routes = routeFiles
  .map(requireRoute)
  .filter(v=>!!v)
  .sort(SGRoutes.routeSort);
routes.map(registerRoute);
exports.default = app;
app.listen(8080,()=>console.log("Started"))`
