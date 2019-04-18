import { flatten } from 'lodash'

export type TTrayItem = JSX.Element[]

export type TTray = 'bodyBegin' | 'bodyEnd'

interface ITray {
  [key: string]: TTrayItem[]
}

class Tray {
  trays: ITray = {}

  add = (tray: TTray, jsx: JSX.Element, position: number = 50) => {
    if (!this.trays[tray]) {
      this.trays[tray] = [] as TTrayItem[]
    }
    if (!this.trays[tray][position]) {
      this.trays[tray][position] = [] as TTrayItem
    }
    this.trays[tray][position].push(jsx)
  }

  get = (tray: TTray): TTrayItem => {
    return this.trays[tray] ? flatten(this.trays[tray]) : []
  }
}

const t = new Tray()

const addToBodyTray = t.add
const getTray = t.get

export { addToBodyTray, getTray }
