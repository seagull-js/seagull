import * as AWS from 'aws-sdk'
import 'chai/register-should'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { BasicTest, S3 } from '../../src'

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
    const response = await this.deleteFileFromS3('stuff.txt')
    response.should.be.deep.equal({})
    mock.deactivate()
  }

  private async deleteFileFromS3(path: string) {
    const params = { Bucket: 'DemoBucket123', Key: path }
    const client = new AWS.S3()
    return await client.deleteObject(params).promise()
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
