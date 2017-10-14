import * as React from 'react'

export default abstract class Page<S, P> extends React.Component<S, P> {
  abstract path: string
  abstract render(props?: any): any

  async before(): Promise<P> {
    return {} as P
  }
}