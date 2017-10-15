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
    expect(todo._interface).to.contain({ id: 'String' })
    expect(todo._interface).to.contain({ done: 'Boolean' })
    expect(todo._interface).to.contain({ text: 'String' })
  }

  @test
  async 'models generate IDs on save'() {
    const todo = new Todo()
    expect(todo._id).to.be.equal(null)
    await todo.save()
    expect(todo._id).to.be.a('string')
    expect(todo._id.length).to.be.above(0)
  }

  @test
  async 'models do not override IDs on updating'() {
    const todo = new Todo()
    expect(todo._id).to.be.equal(null)
    const { _id } = await todo.save()
    expect(todo._id).to.be.a('string')
    expect(todo._id.length).to.be.above(0)
    await todo.save()
    expect(todo._id).to.be.equal(_id)
  }
}
