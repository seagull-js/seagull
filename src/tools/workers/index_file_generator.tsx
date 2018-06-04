/** @module Tools */
import { join } from 'path'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Layout } from '../../frontend/components/Layout'
import { writeFile } from '../util'
import { IWorker } from './interface'

/**
 * Generate a basic index.html file for a "dumb" single-page-app webserver that
 * does not need SSR at all.
 */
export class IndexFileGenerator implements IWorker {
  constructor(public srcFolder: string) {}

  async watcherWillStart() {
    const html = renderToStaticMarkup(<Layout />)
    const filePath = join(this.srcFolder, '.seagull/dist/index.html')
    writeFile(filePath, html)
  }
}
