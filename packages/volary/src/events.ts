import { EventEmitter } from 'events'
const ee = new EventEmitter()

export const Event = { emit: ee.emit, on: ee.on }
