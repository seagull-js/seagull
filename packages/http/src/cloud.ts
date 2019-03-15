import { Injectable } from 'injection-js'
import fetch, { RequestInit, Response } from 'node-fetch'
import 'reflect-metadata'
import { HttpBase } from './base'

/**
 * Http (default) cloud mode implementation.
 */
@Injectable()
export class Http extends HttpBase {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    return await fetch(url, init)
  }
}
