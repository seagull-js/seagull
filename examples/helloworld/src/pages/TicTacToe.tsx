import * as React from 'react'
import { style } from 'typestyle'
import { Page } from '@seagull/pages'

export interface State {
  currentPlayer: string
  board: string[]
  winner: string
}

const boardStyle = style({
  border: '2px solid black',
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  maxWidth: 300,
})

const tileStyle = style({
  alignItems: 'center',
  border: '1px solid black',
  display: 'flex',
  fontSize: 20,
  gridColumn: 'span 4',
  height: 100,
  justifyContent: 'center',
  minHeight: 100,
})

export default class TicTacToe extends Page {
  state = this.newGame()

  html() {
    return (
      <div>
        <h1>Tic Tac Toe</h1>
        <hr />
        <p>currentPlayer: {this.state.currentPlayer}</p>
        {this.state.winner !== '' && <p>Winner: {this.state.winner}</p>}
        <div className={boardStyle}>
          {this.state.board.map((field, index) => (
            <div
              key={index}
              className={tileStyle}
              onClick={() => this.click(index)}
            >
              {field}
            </div>
          ))}
        </div>
      </div>
    )
  }

  click = (num: number) => {
    this.makeMove(num)
    this.checkVictory()
  }

  newGame(startPlayer: string = 'X'): State {
    const currentPlayer = startPlayer
    const board = Array(9).fill('')
    const winner = ''
    return { board, currentPlayer, winner }
  }

  makeMove = (index: number) => {
    const p = this.state.currentPlayer
    const b = this.state.board
    const current = b[index]
    if (!current) {
      b[index] = p
      const nextPlayer = p === 'X' ? 'O' : 'X'
      this.setState({ board: b, currentPlayer: nextPlayer })
    }
  }

  checkVictory = () => {
    const possibilities = [
      this.line(0, 1, 2),
      this.line(3, 4, 5),
      this.line(6, 7, 8),
      this.line(0, 3, 6),
      this.line(1, 4, 7),
      this.line(2, 5, 8),
      this.line(0, 4, 8),
      this.line(2, 4, 6),
    ]
    const winner = possibilities.filter(pb => !!pb).length > 0
    if (winner) {
      this.setState({ winner: this.state.currentPlayer })
    }
  }

  checkTie = () => this.state.board.filter(field => !!field).length === 8

  line = (a: number, b: number, c: number) =>
    !!this.state.board[a] &&
    this.state.board[a] === this.state.board[b] &&
    this.state.board[b] === this.state.board[c]
}
