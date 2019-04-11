import * as _ from 'lodash'
import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as withSideEffect from 'react-side-effect'

interface PropsType {
  children: string
}

class NoScript extends React.Component<PropsType, {}> {
  static propTypes = {
    children: PropTypes.string,
    noscript: PropTypes.string,
  }
  static peek: undefined
  static rewind: undefined
  render() {
    return null
  }
}

const reducePropsToState = (noscriptTags: any[]) => {
  return noscriptTags.map(t => t.children).join('\r\n')
}

const handleStateChangeOnClient = (noscript: string) => {
  const nsTag = document.body.getElementsByTagName('noscript')[0]
  const nsTagInvalid = !nsTag || nsTag.title !== 'noscript-the-one-and-only'
  if (nsTagInvalid) {
    throw new Error('noscript-the-one-and-only tag is missing')
  }
  nsTag.innerHTML = noscript
}

const NoScriptSideEffects = withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient
)(NoScript)

export { NoScriptSideEffects as NoScript }
export default NoScriptSideEffects
