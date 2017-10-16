import { expect } from 'chai'
import { skip, slow, suite, test, timeout } from 'mocha-typescript'
import Model from '../../lib/model/'
import Todo from './example/todo'

@suite.only('Models work')
class ModelsTest {
  @test
  async 'models have inferrable names and are dasherized'() {
    // tslint:disable-next-line:max-classes-per-file
    const cm = new class CustomModel extends Model {}()
    expect(cm._name).to.be.equal('custom-model')
  }

  @test
  async 'models have inferrable attributes and types'() {
    const todo = new Todo()
    expect(todo._interface).to.contain({ id: 'string' })
    expect(todo._interface).to.contain({ done: 'boolean' })
    expect(todo._interface).to.contain({ text: 'string' })
  }

  @test
  async 'models generate IDs on save'() {
    const todo = new Todo()
    expect(todo._id).to.be.equal('')
    await todo.save()
    expect(todo._id).to.be.a('string')
    expect(todo._id.length).to.be.above(0)
  }

  @test
  async 'models do not override IDs on updating'() {
    const todo = new Todo()
    expect(todo._id).to.be.equal('')
    const { _id } = await todo.save()
    expect(todo._id).to.be.a('string')
    expect(todo._id.length).to.be.above(0)
    await todo.save()
    expect(todo._id).to.be.equal(_id)
  }

  @test async 'models can check validity'() {
    const todo = new Todo()
    expect(todo._isValid).to.be.equal(true)
    expect(todo._errors).to.have.length(0)
    Object.assign(todo, { text: 17 })
    expect(todo._isValid).to.be.equal(false)
    expect(todo._errors).to.contain('text')
  }

  @test async 'find model by id works'() {
    const original = await Todo.create({ done: false, text: 'stuff' })
    expect(original).to.be.an('object')
    const todo = await Todo.find(original._id)
    expect(todo).to.be.an('object')
    expect(todo._id).to.be.equal(original._id)
  }
}
