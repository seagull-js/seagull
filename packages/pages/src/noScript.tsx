import * as _ from 'lodash'
import * as PropTypes from 'prop-types'
import * as React from 'react'
import * as withSideEffect from 'react-side-effect'

interface PropsType {
  children: string
}

let content = 'too early'

class NoScript extends React.Component<PropsType, {}> {
  static propTypes = {
    noscript: PropTypes.string,
  }
  static rewind() {
    content = ''
  }
  static renderStatic() {
    return content
  }
  render() {
    return null
  }
}

const reducePropsToState = (noscriptTags: any[]) => {
  return noscriptTags.map(t => t.children).join('\r\n')
}

const handleStateChangeOnClient = (state: string) => {
  const nsTag = document.body.getElementsByTagName('noscript')[0]
  const nsTagInvalid = !nsTag || nsTag.title !== 'noscript-the-one-and-only'
  if (nsTagInvalid) {
    throw new Error('noscript-the-one-and-only tag is missing')
  }
  nsTag.innerHTML = state
}

const mapStateOnServer = (state: string) => {
  content = state
  return state
}

const NoScriptSideEffects = withSideEffect(
  reducePropsToState,
  handleStateChangeOnClient,
  mapStateOnServer
)(NoScript)
Object.assign(NoScriptSideEffects, {
  renderStatic: NoScript.renderStatic,
  rewind: NoScript.rewind,
})

export { NoScriptSideEffects as NoScript }
export default NoScriptSideEffects
