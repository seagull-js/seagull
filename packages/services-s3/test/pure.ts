import { BasicTest } from '@seagull/testing'
import { expect } from 'chai'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3Pure } from '../src'

@suite('S3::Pure')
export class Test extends BasicTest {
  s3 = new S3Pure()

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
  async 'can write multiple files into a bucket'() {
    await this.s3.writeFiles('mybucket', [
      { path: 'index2.html', content: 'test2' },
      { path: 'index3.html', content: 'test3' },
    ])
    const file2 = await this.s3.readFile('mybucket', 'index2.html')
    expect(file2).to.be.equal('test2')
    const file3 = await this.s3.readFile('mybucket', 'index3.html')
    expect(file3).to.be.equal('test3')
  }

  @test
  async 'can read all files in a bucket with a prefix'() {
    await this.s3.writeFile('mybucket', 'assets/bundle.js', '')
    await this.s3.writeFile('mybucket', 'index.html', '')
    const list = await this.s3.listFiles('mybucket', 'assets')
    expect(list).to.deep.equal(['assets/bundle.js'])
  }

  @test
  async 'readFile returns an error if target does not exist or is empty'() {
    try {
      await this.s3.readFile('mybucket', 'index.html')
    } catch (e) {
      expect(e.message).to.eq('S3: File not found or empty.')
    }
  }

  @test
  async 'can delete files'() {
    await this.s3.writeFile('mybucket', 'index.html', 'content')
    const file = await this.s3.readFile('mybucket', 'index.html')
    expect(file).to.be.equal('content')
    await this.s3.deleteFile('mybucket', 'index.html')
    try {
      await this.s3.readFile('mybucket', 'index.html')
    } catch (e) {
      expect(e.message).to.eq('S3: File not found or empty.')
    }
  }

  @test
  async 'can add local folder to mocked S3 bucket'() {
    await this.s3.writeFolder('mybucket', `${process.cwd()}/seed/static`)
    const file = await this.s3.readFile('mybucket', 'index.html')
    expect(file).to.eq('content\n')
    const file2 = await this.s3.readFile('mybucket', 'asdf/asdf.html')
    expect(file2).to.eq('asdf\n')
  }
}
