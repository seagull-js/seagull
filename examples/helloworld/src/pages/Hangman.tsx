import * as React from 'react'
import { style } from 'typestyle'
import { Page } from '@seagull/pages'

class HangmanPage extends Page {
  html() {
    return <Hangman />
  }
}

export default HangmanPage

// ****************************************************************************
// main component
// ****************************************************************************

class Hangman extends React.Component {
  static maxFails: number = 8

  state: AppState = {
    inputValue: '',
    guessString: '',
    guessChars: '',
    step: 'start',
    fails: 0,
  }

  // --- functions ------------------------------------------------------------
  inputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      inputValue: event.target.value.toLowerCase(),
    })
  }

  startGame = () => {
    this.setStep('play')

    let guessString: string = this.state.guessString
    if (guessString.length > 1) {
      guessString = ''
    }

    for (let i: number = 0; i < this.state.inputValue.length; i++) {
      guessString += '_'
    }

    this.setState({
      guessString: guessString,
    })
  }

  setStep = (value: string) => {
    this.setState({
      step: value,
    })
  }

  addGuess = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase()
    const newGuessChar: string =
      this.state.guessChars.length === 0
        ? value
        : this.state.guessChars + ', ' + value

    this.setState({
      guessChars: newGuessChar,
    })

    let fail: boolean = true
    let newGuessString = this.state.guessString
    for (let i: number = 0; i < this.state.inputValue.length; i++) {
      if (this.state.inputValue[i] === value.toLowerCase()) {
        fail = false

        newGuessString =
          newGuessString.substring(0, i) +
          value +
          newGuessString.substring(i + 1)
      }
    }

    if (newGuessString !== this.state.guessString) {
      this.setState(
        {
          guessString: newGuessString,
        },
        this.checkForSuccess
      )
    }

    if (fail) {
      this.addFail()
    }
  }

  addFail = () => {
    const newFails: number = this.state.fails + 1
    this.setState(
      {
        fails: newFails,
      },
      this.checkForFailure
    )
  }

  checkForSuccess = () => {
    if (this.state.inputValue === this.state.guessString) {
      this.setStep('success')
    }
  }

  checkForFailure = () => {
    if (this.state.fails >= Hangman.maxFails) {
      this.setStep('failure')
    }
  }

  restart = () => {
    this.setState({
      inputValue: '',
      guessString: '',
      guessChars: '',
      step: 'start',
      fails: 0,
    })
  }

  // --- html -----------------------------------------------------------------
  render() {
    return (
      <div>
        {this.state.step !== 'start' && (
          <HangmanAscii fails={this.state.fails} />
        )}
        {this.state.step === 'start' && (
          <StartPage
            inputValue={this.state.inputValue}
            inputChange={this.inputChange}
            startClicked={this.startGame}
          />
        )}
        {this.state.step === 'play' && (
          <PlayPage
            fails={this.state.fails}
            guessString={this.state.guessString}
            guessChars={this.state.guessChars}
            backClicked={() => this.setStep('start')}
            addGuess={this.addGuess}
          />
        )}
        {(this.state.step === 'success' || this.state.step === 'failure') && (
          <EndPage
            headline={
              this.state.step === 'success' ? 'Glückwunsch!' : 'Schade!'
            }
            inputValue={this.state.inputValue}
            restartClicked={this.restart}
          />
        )}
      </div>
    )
  }
}

interface AppState {
  inputValue: string
  guessString: string
  guessChars: string
  step: string
  fails: 0
}

// ****************************************************************************
// start page
// ****************************************************************************

class StartPage extends React.Component<StartProps> {
  // --- style ----------------------------------------------------------------
  StartPageWrapper = style({
    $debugName: 'StartPageWrapper',
    padding: '10px 5px',
  })
  startButtonStyle = style({
    $debugName: 'startButtonStyle',
    marginTop: 15,
  })

  // --- html -----------------------------------------------------------------
  render() {
    return (
      <div className={this.StartPageWrapper}>
        <Input
          label="Zu erratendes Wort eingeben:"
          inputValue={this.props.inputValue ? this.props.inputValue : ''}
          onChange={this.props.inputChange}
          onEnterKey={this.props.startClicked}
        />
        <button
          className={this.startButtonStyle}
          onClick={this.props.startClicked}
        >
          Start
        </button>
      </div>
    )
  }
}

interface StartProps {
  inputValue?: string
  inputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  startClicked: () => void
}

// ****************************************************************************
// playing page
// ****************************************************************************

class PlayPage extends React.Component<PlayProps> {
  // --- style ----------------------------------------------------------------
  guessInputStyle = style({
    $debugName: 'guessInputStyle',
    marginTop: 15,
  })
  guessStringWrapperStyle = style({
    display: 'flex',
  })
  guessStringStyle = style({
    marginLeft: 5,
    letterSpacing: 3,
  })
  failsStyle = style({
    marginTop: 15,
  })

  // --- html -----------------------------------------------------------------
  render() {
    return (
      <div>
        <button onClick={this.props.backClicked}> Abbrechen </button>
        <div className={this.guessInputStyle}>
          <Input
            label="Buchstaben eingeben"
            onChange={this.props.addGuess}
            inputValue=""
          />
        </div>
        <div>letztes Zeichen: {this.props.guessChars}</div>
        <div className={this.guessStringWrapperStyle}>
          Ergebnis:
          <div className={this.guessStringStyle}> {this.props.guessString}</div>
        </div>
        <div className={this.failsStyle}>Fails: {this.props.fails}</div>
      </div>
    )
  }
}

interface PlayProps {
  fails: number
  guessString: string
  guessChars: string
  backClicked: (event: React.MouseEvent<HTMLButtonElement>) => void
  addGuess: (event: React.ChangeEvent<HTMLInputElement>) => void
}

// ****************************************************************************
// end page
// ****************************************************************************

class EndPage extends React.Component<EndProps> {
  // --- style ----------------------------------------------------------------
  endHeadlineStyle = style({
    fontSize: 20,
  })
  guessStringWrapperStyle = style({
    display: 'flex',
  })
  guessStringStyle = style({
    marginLeft: 5,
    fontWeight: 'bold',
  })
  restartButtonStyle = style({
    marginTop: 15,
  })

  // --- html -----------------------------------------------------------------
  render() {
    return (
      <div>
        <div className={this.endHeadlineStyle}>{this.props.headline}</div>
        <div className={this.guessStringWrapperStyle}>
          <div> das gesuchte Wort war </div>
          <div className={this.guessStringStyle}> {this.props.inputValue}</div>
        </div>
        <button
          className={this.restartButtonStyle}
          onClick={this.props.restartClicked}
        >
          Neustart
        </button>
      </div>
    )
  }
}

interface EndProps {
  headline: string
  inputValue: string
  restartClicked: (event: React.MouseEvent<HTMLButtonElement>) => void
}

// ****************************************************************************
// input component
// ****************************************************************************

class Input extends React.Component<InputProps> {
  // --- style ----------------------------------------------------------------
  inputWrapper = style({
    $debugName: 'inputWrapper',
    display: 'flex',
  })
  inputStyle = style({
    $debugName: 'inputStyle',
    marginLeft: 10,
  })

  // --- functions ------------------------------------------------------------
  handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (this.props.onEnterKey) {
        this.props.onEnterKey(event)
      }
    }
  }

  // --- html -----------------------------------------------------------------
  render() {
    return (
      <div className={this.inputWrapper}>
        <div> {this.props.label}</div>
        <input
          className={this.inputStyle}
          value={this.props.inputValue}
          onChange={this.props.onChange}
          onKeyPress={this.handleKeyPress}
        />
      </div>
    )
  }
}

interface InputProps {
  label: string
  inputValue: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onEnterKey?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

// ****************************************************************************
// hangman ASCII
// ****************************************************************************

class HangmanAscii extends React.Component<HangmanAsciiProps> {
  render() {
    return (
      <div>
        {this.props.fails === 0 && (
          <div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
          </div>
        )}
        {this.props.fails === 1 && (
          <div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            ========
          </div>
        )}
        {this.props.fails === 2 && (
          <div>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            ========
          </div>
        )}
        {this.props.fails === 3 && (
          <div>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;||
            <br />
            ========
          </div>
        )}
        {this.props.fails === 4 && (
          <div>
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//||\\
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;||&nbsp;&nbsp;\\
            <br />
            ========
          </div>
        )}
        {this.props.fails === 5 && (
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;==========
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//||\\
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;||&nbsp;&nbsp;\\
            <br />
            ========
          </div>
        )}
        {this.props.fails === 6 && (
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;==========
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//||\\
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;||&nbsp;&nbsp;\\
            <br />
            ========
          </div>
        )}
        {this.props.fails === 7 && (
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;==========
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;O
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//||\\
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;||&nbsp;&nbsp;\\
            <br />
            ========
          </div>
        )}

        {this.props.fails === 8 && (
          <div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;==========
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;O
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/
            | \
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;||&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/
            \
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;//||\\
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;//&nbsp;&nbsp;||&nbsp;&nbsp;\\
            <br />
            ========
          </div>
        )}
      </div>
    )
  }
}

interface HangmanAsciiProps {
  fails: number
}
