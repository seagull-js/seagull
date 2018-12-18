import { FS as FSMock } from '@seagull/mock-fs'
import { BasicTest } from '@seagull/testing'
import * as AWS from 'aws-sdk'
import 'chai/register-should'
import * as fs from 'fs'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { S3 } from '../src'

@suite('Mocks::S3')
export class Test extends BasicTest {
  @test.skip()
  async 'S3 reading does not work without mock'() {
    const result: any = { response: null, error: null }
    try {
      result.response = await this.readFileFromS3('stuff.txt')
    } catch (error) {
      result.error = error
    }
    result.should.have.property('response').that.is.equal(null)
    result.should.have.property('error').that.is.not.equal(null)
  }

  @test.skip()
  async 'S3 writing does not work without mock'() {
    const result: any = { response: null, error: null }
    try {
      result.response = await this.writeFileToS3('stuff.txt', '')
    } catch (error) {
      result.error = error
    }
    result.should.have.property('response').that.is.equal(null)
    result.should.have.property('error').that.is.not.equal(null)
  }

  @test
  async 'can be enabled and disabled'() {
    const mock = new S3()
    mock.activate()
    await this.writeFileToS3('stuff.txt', 'lorem ipsum')
    const { Body } = await this.readFileFromS3('stuff.txt')
    Body!.should.be.equal('lorem ipsum')
    const matchAll = await this.listFilesinS3('')
    matchAll.Contents!.should.be.deep.equal([{ Key: 'stuff.txt' }])
    const matchNone = await this.listFilesinS3('does not exist')
    matchNone.Contents!.should.be.deep.equal([])
    const response = await this.deleteFileFromS3('stuff.txt')
    response.should.be.deep.equal({})
    mock.deactivate()
  }

  @test
  async 'can be resetted'() {
    const mock = new S3()
    mock.activate()
    await this.writeFileToS3('stuff.txt', 'lorem ipsum')
    const { Body } = await this.readFileFromS3('stuff.txt')
    Body!.should.be.equal('lorem ipsum')
    mock.reset()
    const matchAll = await this.listFilesinS3('')
    matchAll.Contents!.should.be.deep.equal([])
    mock.deactivate()
  }
  @test
  async 'preserves state for activate/deactivate'() {
    const mock = new S3()
    mock.activate()
    await this.writeFileToS3('stuff.txt', 'lorem ipsum')
    const { Body } = await this.readFileFromS3('stuff.txt')
    Body!.should.be.equal('lorem ipsum')
    mock.deactivate()
    mock.activate()
    const matchAll = await this.listFilesinS3('')
    matchAll.Contents!.should.be.deep.equal([{ Key: 'stuff.txt' }])
    mock.deactivate()
  }

  @test
  async 'can work with synchronized disc data'() {
    const fsMock = new FSMock('/tmp')
    fsMock.activate()
    const mock = new S3('/tmp/.data')
    mock.activate()
    await this.writeFileToS3('stuff', '17')
    const dataFile = fs.readFileSync('/tmp/.data/s3.json', 'utf-8')
    dataFile.should.be.equal('{"DemoBucket123":{"stuff":"17"}}')
    mock.deactivate()
    const restored = new S3('/tmp/.data')
    restored.storage.should.be.deep.equal({ DemoBucket123: { stuff: '17' } })
    fsMock.deactivate()
  }

  private async deleteFileFromS3(path: string) {
    const params = { Bucket: 'DemoBucket123', Key: path }
    const client = new AWS.S3()
    return await client.deleteObject(params).promise()
  }

  private async listFilesinS3(path: string) {
    const params = { Bucket: 'DemoBucket123', Prefix: path }
    const client = new AWS.S3()
    return await client.listObjectsV2(params).promise()
  }

  private async readFileFromS3(path: string) {
    const params = { Bucket: 'DemoBucket123', Key: path }
    const client = new AWS.S3()
    return await client.getObject(params).promise()
  }

  private async writeFileToS3(path: string, content: string) {
    const params = { Body: content, Bucket: 'DemoBucket123', Key: path }
    const client = new AWS.S3()
    return await client.putObject(params).promise()
  }
}
