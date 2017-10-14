// context detection
const hasWindow = typeof window !== 'undefined'
export const isClient = hasWindow
export const isServer = !hasWindow

// history (context-dependant)
import { createBrowserHistory, createMemoryHistory, History } from 'history'
export const history = isClient ? createBrowserHistory() : createMemoryHistory()
