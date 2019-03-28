import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { Headers, Response } from 'node-fetch'
import * as Path from 'path'

@suite('Http::Dependencies::Http-Fetch')
export class Test extends BasicTest {
  @test
  async 'converts response to utf8 text'() {
    const response = await new Promise<Response>((resolve, reject) => {
      fs.readFile(Path.join(__dirname + '/iso8859.txt'), (err, data) => {
        if (err) {
          reject(err)
          return
        }
        resolve(
          new Response(data, {
            headers: new Headers({
              'Content-Type': 'text/html; charset=iso-8859-1',
            }),
            status: 200,
          })
        )
      })
    })

    const bodyConverted = await response.textConverted()

    const expected: string = 'äöüÄÖÜß abc'

    expect(bodyConverted).to.equal(expected)
  }
}
