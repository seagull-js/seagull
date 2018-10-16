import 'chai/register-should'
import * as events from 'isomorphic-events'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Actor, Event, Message, on } from '../src'

class Increment extends Message {
  amount: number = 1
}

class Counter extends Actor {
  value: number = 0

  @on(Increment)
  inc(props: Increment) {
    this.value += props.amount
  }
}

const wait = () => new Promise(resolve => process.nextTick(() => resolve()))

@suite('Communication')
export class Test {
  @test
  async 'can be subclassed and methods decorated'() {
    const counter = new Counter()
    Event.emit('Increment', new Increment())
    await wait()
    counter.value.should.be.equal(1)
  }
}
