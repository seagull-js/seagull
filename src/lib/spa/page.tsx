import * as React from 'react'

export default abstract class Page<P, S> extends React.Component<P, S> {
  abstract path: string
  abstract render(props?: any): any
}