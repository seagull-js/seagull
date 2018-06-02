/** @module Frontend */

// naive but straightforward browser check
const hasWindow = typeof window !== 'undefined'

/**
 * boolean variable which is true if the current process runs within the browser
 */
export const isClient = hasWindow

/**
 * boolean variable which is true if the current process runs within node.js
 */
export const isServer = !hasWindow

/**
 * global object, which is either `window` within the browser or `global` within
 * a node.js process.
 */
export const root = isClient ? window : global
