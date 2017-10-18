import Model from '../../../lib/model/'
import field from '../../../lib/model/field'

export default class Todo extends Model {
  @field done: boolean = false
  @field text: string = ''
}
