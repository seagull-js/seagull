import { Organism } from '@seagull/core'
import * as React from 'react'

export interface ITodoInputProps {
  onSubmit: (text: string) => void
}

export interface ITodoInputState {
  value: string
}

export default class TodoInput extends Organism<
  ITodoInputProps,
  ITodoInputState
> {
  state: ITodoInputState = { value: '' }

  updateValue = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ value: e.target.value })

  submit = (e: React.MouseEvent<HTMLButtonElement>) => {
    this.props.onSubmit(this.state.value)
    this.setState({ value: '' })
  }

  render() {
    return (
      <div>
        <input
          type="text"
          placeholder={'eg.: "buy milk"'}
          onChange={this.updateValue}
        />
        <button onClick={this.submit}>submit</button>
      </div>
    )
  }
}
