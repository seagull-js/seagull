import { Command } from '@seagull/commands'
import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import * as _ from 'lodash'
import { suite, test } from 'mocha-typescript'
import { Request } from '../../src/commands-http/request'

export interface TestSuiteDefinition<T> {
  name: string
  commands: object
  entities: Array<{
    name: string
    namePlural?: string
    select?: T[]
    handler?: (response: T) => void
  }>
}

export const generateTests = <T>(suiteDef: TestSuiteDefinition<T>) => {
  suite(suiteDef.name, async () => {
    for (const entityDef of suiteDef.entities) {
      let firstItemId = ''
      const itemMany = entityDef.namePlural
        ? entityDef.namePlural
        : `${entityDef.name}s`

      const basicTestInstance = new BasicTest()
      basicTestInstance.before()

      // test many
      test(`can get many ${itemMany}`, async function() {
        this.timeout(30000)
        let response
        try {
          const instance = new (suiteDef.commands as any)[`Get${itemMany}`](
            entityDef.select,
          ) as Command<any[]>

          response = await instance.execute()
          firstItemId = response[0].id

          if (entityDef.handler) {
            for (const responseItem of response) {
              entityDef.handler(responseItem)
            }
          } else {
            // default check
            expect(response).to.be.an('array')
            expect(response.length).to.be.greaterThan(0)
          }
          await instance.revert()
        } catch (err) {
          console.info('response', response)
          throw new Error(err)
        }
      })

      // test single
      const itemSingle = entityDef.name
      test(`can get ${itemSingle}`, async function() {
        this.timeout(30000)
        if (!firstItemId) {
          throw new Error(
            `${itemMany} test failed -> single item test not possible`,
          )
        }
        let response
        try {
          const command = (suiteDef.commands as any)[`Get${itemSingle}`]
          const instance = new command(firstItemId) as Request<any>

          response = await instance.execute()
          if (entityDef.handler) {
            entityDef.handler(response)
          } else {
            // default check
            expect(response).to.be.an('object')
            expect(response).not.to.be.an('array')
            expect(Object.keys(response).length).to.be.greaterThan(0)
          }
          await instance.revert()
        } catch (err) {
          console.info('response', response)
          throw new Error(err)
        }
      })

      basicTestInstance.after()
    }
  })
}
