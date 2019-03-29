import { ServiceTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3, s3ServicesModule } from '../src'

@suite('S3::DeleteFile')
export class Test extends ServiceTest {
  serviceModules = [s3ServicesModule]
  services = []
  s3!: S3

  beforeEach() {
    this.s3 = this.injector.get(S3)
  }

  @test
  async 'can write and read a file'() {
    const content = '<html />'
    await this.s3.writeFile('mybucket', 'index.html', content)
    const file = await this.s3.readFile('mybucket', 'index.html')
    expect(file).to.be.equal(content)
  }

  @test
  async 'can read all files in a bucket'() {
    await this.s3.writeFile('mybucket', 'index.html', '')
    await this.s3.writeFile('mybucket', 'bundle.js', '')
    const list = await this.s3.listFiles('mybucket')
    expect(list).to.deep.equal(['index.html', 'bundle.js'])
  }
  @test
  async 'can read all files in a bucket with a prefix'() {
    await this.s3.writeFile('mybucket', 'assets/bundle.js', '')
    await this.s3.writeFile('mybucket', 'index.html', '')
    const list = await this.s3.listFiles('mybucket', 'assets')
    expect(list).to.deep.equal(['assets/bundle.js'])
  }

  @test
  async 'readFile returns empty string (falsy) if target does not exist'() {
    const file = await this.s3.readFile('mybucket', 'index.html')
    expect(file).to.be.equal('')
  }

  @test
  async 'can delete files'() {
    await this.s3.writeFile('mybucket', 'index.html', 'content')
    const file = await this.s3.readFile('mybucket', 'index.html')
    expect(file).to.be.equal('content')
    await this.s3.deleteFile('mybucket', 'index.html')
    const empty = await this.s3.readFile('mybucket', 'index.html')
    expect(empty).to.be.equal('')
  }
}
