// import { FS } from '@seagull/commands'
// import { BasicTest } from '@seagull/testing'
// import 'chai/register-should'
// import { skip, slow, suite, test, timeout } from 'mocha-typescript'
// import { Observer } from '../src'

// @suite('Observer')
// export class Test extends BasicTest {
//   mocks = [new this.mock.FS('/tmp')]

//   @test
//   async 'can build initial dist folder from scratch'() {
//     await new FS.WriteFile('/tmp/src/a.ts', 'export default {}').execute()
//     await new FS.WriteFile('/tmp/src/b.tsx', 'export default {}').execute()
//     const observer = new Observer('/tmp')
//     await observer.initialize()
//     const jsFile = await new FS.Exists('/tmp/dist/src/a.js').execute()
//     const jsxFile = await new FS.Exists('/tmp/dist/src/b.js').execute()
//     jsFile.should.be.equal(true)
//     jsxFile.should.be.equal(true)
//   }
// }
