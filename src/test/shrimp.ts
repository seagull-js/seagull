import { PackageJson } from '@seagull/package-config'
import * as AWSMock from 'aws-sdk-mock'
import 'chai/register-should'
import { find } from 'lodash'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { field, Shrimp } from '../lib'

const pkg = new PackageJson()

class Todo extends Shrimp {
  @field text: string = ''
  @field done: boolean = false
}
// tslint:disable-next-line:max-classes-per-file
@suite('Shrimp')
class Test {
  db: any

  before() {
    this.db = {}
    AWSMock.mock('SimpleDB', 'getAttributes', ({ ItemName }, cb) =>
      cb(null, { Attributes: this.db[ItemName] })
    )
    AWSMock.mock(
      'SimpleDB',
      'putAttributes',
      ({ ItemName, Attributes }, cb) => {
        this.db[ItemName] = Attributes
        cb(null, Attributes)
      }
    )
    AWSMock.mock('SimpleDB', 'deleteAttributes', ({ ItemName }, cb) => {
      delete this.db[ItemName]
      cb(null)
    })
    AWSMock.mock('SimpleDB', 'listDomains', cb => {
      const list = [`${pkg.name}-dev-Shrimp-123`, `${pkg.name}-dev-Todo-123`]
      cb(null, { DomainNames: list })
    })
  }

  after() {
    AWSMock.restore('SimpleDB')
  }

  @test
  async 'can be instantiated'() {
    const shrimp = new Shrimp()
    shrimp.should.be.an('object')
    shrimp.should.be.instanceOf(Shrimp)
    const todo = new Todo()
    todo.should.be.an('object')
    todo.should.be.instanceOf(Todo)
  }

  @test
  async 'can get own SimpleDB domain name'() {
    const shrimp = new Shrimp()
    const domain = await shrimp._domain()
    domain.should.be.equal('@seagull/core-dev-Shrimp-123')
  }

  @test
  async 'can be created and fields get serialized to SimpleDB attributes'() {
    Object.keys(this.db).length.should.be.equal(0)
    const todo = await Todo.Create({ text: 'txt', done: false })
    Object.keys(this.db).length.should.be.equal(1)
    const attrs = this.db[todo._id]
    attrs.should.be.an('array')
    attrs.should.have.length(5)
    find(attrs, a => a.Name === 'id').Value.length.should.be.above(0)
    find(attrs, a => a.Name === 'createdAt').Value.length.should.be.above(0)
    find(attrs, a => a.Name === 'updatedAt').Value.length.should.be.above(0)
    find(attrs, a => a.Name === 'text').Value.should.be.equal('txt')
    find(attrs, a => a.Name === 'done').Value.should.be.equal('false')
  }

  @test
  async 'can remove items from database'() {
    Object.keys(this.db).length.should.be.equal(0)
    const todo = await Todo.Create({ text: 'txt', done: false })
    Object.keys(this.db).length.should.be.equal(1)
    await todo.remove()
    Object.keys(this.db).length.should.be.equal(0)
  }

  @test
  async 'can find items from database by id and deserialize fields'() {
    const todo = await Todo.Create({ text: 'txt', done: false })
    const result = await Todo.Find(todo._id)
    result.should.be.an('object')
    result.should.be.instanceOf(Todo)
    result._id.should.be.a('string')
    result._createdAt.should.be.a('date')
    result._updatedAt.should.be.a('date')
    result.text.should.be.equal('txt')
    result.done.should.be.equal(false)
    result._id.should.be.equal(todo._id)
    result.should.be.deep.equal(todo)
  }
}
