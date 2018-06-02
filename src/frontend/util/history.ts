/** @module Frontend */
import * as History from 'history'
import browser from 'history/createBrowserHistory'
import memory from 'history/createMemoryHistory'
import { isClient } from './environment'

/**
 * within a browser, get access to a native history abstraction, or within
 * node.js get some faked implementation
 */
export const history = isClient ? browser() : memory()
