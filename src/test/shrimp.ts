import * as AWSMock from 'aws-sdk-mock'
import 'chai/register-should'
import { find } from 'lodash'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import { field, Shrimp } from '../lib/shrimp'

class Todo extends Shrimp {
  @field text: string = ''
  @field done: boolean = false
}

@suite.only('Shrimp')
class Test {
  db: any

  before() {
    this.db = {}
    AWSMock.mock('SimpleDB', 'getAttributes', ({ ItemName }, cb) =>
      cb(null, this.db[ItemName])
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
  }

  after() {
    AWSMock.restore('SimpleDB')
  }

  @test
  async 'has inferrable name and is dasherized'() {
    // tslint:disable-next-line:max-classes-per-file
    const cs = new class CustomShrimp extends Shrimp {}()
    cs._name.should.be.equal('custom-shrimp')
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
  async 'can be created'() {
    Object.keys(this.db).length.should.be.equal(0)
    const todo = await Todo.create({ text: 'txt', done: false })
    Object.keys(this.db).length.should.be.equal(1)
    this.db[todo._id].should.be.an('array')
    this.db[todo._id].should.have.length(5)
  }

  @test
  async 'can serialize fields to SimpleDB attributes'() {
    const todo = await Todo.create({ text: 'txt', done: false })
    const attrs = Todo._serialize(todo)
    attrs.should.be.an('array')
    find(attrs, a => a.Name === 'id').Value.length.should.be.above(0)
    find(attrs, a => a.Name === 'createdAt').Value.length.should.be.above(0)
    find(attrs, a => a.Name === 'updatedAt').Value.length.should.be.above(0)
    find(attrs, a => a.Name === 'text').Value.should.be.equal('txt')
    find(attrs, a => a.Name === 'done').Value.should.be.equal('false')
  }

  @test
  async 'can deserialize SimpleDB attributes into fields'() {
    const todo = await Todo.create({ text: 'txt', done: false })
    const attrs = Todo._serialize(todo)
    const instance = Todo._deserialize(attrs)
    instance.should.be.an('object')
    instance.should.be.instanceOf(Todo)
    instance._id.should.be.a('string')
    instance._createdAt.should.be.a('date')
    instance._updatedAt.should.be.a('date')
    instance.text.should.be.equal('txt')
    instance.done.should.be.equal(false)
    instance.should.be.deep.equal(todo)
  }

  @test
  async 'can remove items from database'() {
    Object.keys(this.db).length.should.be.equal(0)
    const todo = await Todo.create({ text: 'txt', done: false })
    Object.keys(this.db).length.should.be.equal(1)
    await todo.remove()
    Object.keys(this.db).length.should.be.equal(0)
  }
}
