#!/usr/bin/env node

/**
 * minimalistic build script, easier than massiv scripts in package.json
 */
const { Bundle, Compile, Generate } = require('@seagull/build')
const sh = require('shelljs')
const fs = require('fs')
const path = require('path')
const flatten = require('lodash').flatten

/**
 * performance helpers
 */
const cache = {}

// reset and prepare target folder
sh.exec("rm -rf dist")
sh.exec("./node_modules/.bin/tsc")
sh.exec("mkdir dist/assets")
sh.exec("mkdir dist/assets/backend")
sh.exec("mkdir dist/assets/pages")
sh.exec("cp -r static dist/assets/static")

// generate code bundles
bundleVendor()
bundleBackend()
listFiles(`${process.cwd()}/dist/pages`).forEach(file => {
    if (/.js$/.test(file)) {
        const relative = path.relative(process.cwd() + '/dist/pages', file)
        bundlePage(relative)
    }
})

/**
 * helper functions
 */

function bundleVendor() {
    new Bundle.Vendor(['react', 'react-dom', 'lodash'], 'dist/assets/static/vendor.js').execute()
}

function bundleBackend() {
    new Generate.Express(['index_route', 'page_route', 'params_route', 'tic_tac_toe'], 'dist/app.js').execute()
    new Generate.Server('dist/index.js').execute()
    new Generate.Lambda('dist/lambda.js').execute()
    new Bundle.Backend('dist/index.js', 'dist/assets/backend/server.js', cache).execute()
    new Bundle.Backend('dist/lambda.js', 'dist/assets/backend/lambda.js', cache).execute()
}

function bundlePage(filePath) {
    const from = `dist/pages/${filePath}`
    const to = `dist/assets/pages/${filePath}`
    new Bundle.Page(from, to, ['react', 'react-dom', 'lodash']).execute()
}

function listFiles(cwd) {
    if (fs.lstatSync(cwd).isFile()) {
        return [cwd]
    } else {
        const names = fs.readdirSync(cwd)
        const list = names.map(f => listFiles(`${cwd}/${f}`))
        return flatten(list)
    }
}