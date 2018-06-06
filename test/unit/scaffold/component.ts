import { Component } from '@scaffold'
import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { join } from 'path'

@suite('Unit::Scaffold::Component')
class Test {
  @test
  'can be initialized'() {
    const gen = Component('MyDiv')
    expect(gen).to.be.an('object')
  }

  @test
  'begins with correct react import'() {
    const gen = Component('MyDiv')
    const code = gen.toString()
    expect(code).to.contain(`import * as React from 'react'`)
  }

  @test
  'when function, contains props-children param'() {
    const gen = Component('MyDiv', false)
    const code = gen.toString()
    expect(code).to.contain(`function MyDiv({ children }) {`)
  }

  @test
  'when class, contains constructor'() {
    const gen = Component('MyDiv', true)
    const code = gen.toString()
    expect(code).to.contain(`constructor(props: IProps) {`)
    expect(code).to.contain(`super(props)`)
    expect(code).to.contain(`this.state = {}`)
  }

  @test
  'when class, contains render method'() {
    const gen = Component('MyDiv', true)
    const code = gen.toString()
    expect(code).to.contain(`render() {`)
  }

  @test
  'when class, contains knterfaces for state/props'() {
    const gen = Component('MyDiv', true)
    const code = gen.toString()
    expect(code).to.contain(`export interface IProps`)
    expect(code).to.contain(`export interface IState`)
  }
}
