#!/usr/bin/env node

/**
 * minimalistic build script, easier than massiv scripts in package.json
 */

const sh = require('shelljs')
const fs = require('fs')
const path = require('path')
const flatten = require('lodash').flatten

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
    const params = '-r react -r react-dom -r lodash'
    const uglify = 'node_modules/.bin/uglifyjs --compress --mangle --keep-classnames --safari10'
    sh.exec(`browserify ${params} | ${uglify} > dist/assets/static/vendor.js`)
}

function bundleBackend() {
    const uglify = 'node_modules/.bin/uglifyjs --compress --mangle --keep-classnames --safari10'
    sh.exec(`browserify --node dist/index.js | ${uglify} > dist/assets/backend/server.js`)
    sh.exec(`browserify --node dist/lambda.js | ${uglify} > dist/assets/backend/lambda.js`)
}

function bundlePage(filePath) {
    const uglify = 'node_modules/.bin/uglifyjs --compress --mangle --keep-classnames --safari10'
    const params = '-x react -x react-dom -x lodash --standalone Page'
    const from = `dist/pages/${filePath}`
    const to = `dist/assets/pages/${filePath}`
    sh.exec(`browserify ${params} ${from} | ${uglify} > ${to}`)
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