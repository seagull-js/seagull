import * as React from 'react'
import { style } from 'typestyle'
import { Page } from '@seagull/pages/dist/src/Page'

interface TicTacToeState {
  score: {
    o: number
    x: number
  }
  currentGameIsFinished: boolean
  currentPlayer: string
  lastResult: string
  fields: string[]
}

const boardStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  maxWidth: 300,
}

const resetStyle = {
  backgroundColor: '#ccc',
  display: 'inline-block',
  margin: '10px',
  padding: '10px',
}

export default class TicTacToe extends Page {
  state = {
    currentGameIsFinished: false,
    currentPlayer: 'X',
    fields: ['', '', '', '', '', '', '', '', ''],
    lastResult: 'No game played yet.',
    score: {
      o: 0,
      x: 0,
    },
  }

  html() {
    const TicTacToeFields = () => this.renderFields()
    return (
      <div>
        <p>Score</p>
        <p> X: {this.state.score.x}</p>
        <p> O: {this.state.score.o}</p>
        <p>Current Player: {this.state.currentPlayer}</p>
        <p>Last Result: {this.state.lastResult}</p>
        <div style={resetStyle} onClick={() => this.resetGame()}>
          Reset
        </div>
        <TicTacToeFields />
      </div>
    )
  }

  resetGame() {
    this.setState({
      currentGameIsFinished: false,
      fields: ['', '', '', '', '', '', '', '', ''],
    })
  }

  renderFields(): JSX.Element {
    return (
      <div id="grid" style={boardStyle}>
        {this.renderField(this.state.fields[0], 0, 0)}
        {this.renderField(this.state.fields[1], 1, 0)}
        {this.renderField(this.state.fields[2], 2, 0)}
        {this.renderField(this.state.fields[3], 0, 1)}
        {this.renderField(this.state.fields[4], 1, 1)}
        {this.renderField(this.state.fields[5], 2, 1)}
        {this.renderField(this.state.fields[6], 0, 2)}
        {this.renderField(this.state.fields[7], 1, 2)}
        {this.renderField(this.state.fields[8], 2, 2)}
      </div>
    )
  }

  renderField(field: string, ver: number, hor: number) {
    const style = getFieldStyle(ver, hor)
    const click = () => this.fieldClick(ver, hor)
    return (
      <div style={style} onClick={click}>
        {field}
      </div>
    )
  }

  fieldClick(ver: number, hor: number) {
    const fields = this.state.fields
    const field = fields[3 * hor + ver]
    if (field === 'X' || field === 'O' || this.state.currentGameIsFinished) {
      return
    }
    fields[3 * hor + ver] = this.state.currentPlayer
    this.setState({
      currentPlayer: this.state.currentPlayer === 'X' ? 'O' : 'X',
      fields,
    })
    this.checkForWinner()
  }

  checkForWinner() {
    if (this.state.currentGameIsFinished) {
      return
    }
    const fields = this.state.fields
    const xs: number[] = []
    const os: number[] = []
    fields.forEach((field: string, index: number) =>
      field === 'O' ? os.push(index) : 'NOOP'
    )
    fields.forEach((field: string, index: number) =>
      field === 'X' ? xs.push(index) : 'NOOP'
    )
    if (checkIfPlayerHasWon(xs)) {
      this.setState({
        currentGameIsFinished: true,
        lastResult: 'X won.',
        score: {
          o: this.state.score.o,
          x: this.state.score.x + 1,
        },
      })
    } else if (checkIfPlayerHasWon(os)) {
      this.setState({
        currentGameIsFinished: true,
        lastResult: 'O won.',
        score: {
          o: this.state.score.o + 1,
          x: this.state.score.x,
        },
      })
    } else if (xs.length + os.length === 9) {
      this.setState({ lastResult: 'Tie' })
    }
  }
}

const winnigCombinations: number[][] = [
  [0, 1, 2],
  [0, 3, 6],
  [0, 4, 8],
  [1, 4, 7],
  [2, 4, 6],
  [2, 5, 8],
  [3, 4, 5],
  [6, 7, 8],
]

function checkIfPlayerHasWon(playerFields: number[]) {
  let hasWon = false
  const found = (n: number) => playerFields.indexOf(n) > -1
  const checkFields = (c: number[]) => found(c[0]) && found(c[1]) && found(c[2])
  const checkCombo = (c: number[]) =>
    checkFields(c) ? (hasWon = true) : 'NOOP'
  winnigCombinations.forEach(checkCombo)
  return hasWon
}

function getFieldStyle(ver: number, hor: number) {
  return {
    alignItems: 'center',
    borderBottom: hor === 2 ? '' : '1px solid',
    borderLeft: ver === 0 ? '' : '1px solid',
    borderRight: ver === 2 ? '' : '1px solid',
    borderTop: hor === 0 ? '' : '1px solid',
    display: 'flex',
    fontSize: 20,
    gridColumn: 'span 4',
    height: 100,
    justifyContent: 'center',
    minHeight: 100,
  }
}
