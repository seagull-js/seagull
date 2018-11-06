import { S3 } from '@seagull/commands'

// TODO make the bucket name configurable (singleton)
const bucketName = 'demo-bucket'

export abstract class Item {
  // delete an existing object from the database
  static async delete<T extends Item>(this: { new (): T }, id: string) {
    const name = new this().constructor.name
    const key = `${name}/${id}.json`
    return await new S3.DeleteFile(bucketName, key).execute()
  }

  // Fetch an object from the database by id
  static async get<T extends Item>(this: { new (): T }, id: string) {
    const name = new this().constructor.name
    const key = `${name}/${id}.json`
    const content = await new S3.ReadFile(bucketName, key).execute()
    if (content !== '') {
      const data = JSON.parse(content)
      const instance: T = Object.assign(new this(), data)
      return instance
    } else {
      throw new Error(`Item with id '${id}' does not exist`)
    }
  }

  // directly create a new object from parameters, save it and then return it
  static async put<T extends Item>(
    this: { new (...args: any): T },
    data: Partial<T> & { id: string }
  ) {
    const instance: T = Object.assign(new this(), data)
    return instance.save()
  }

  abstract id: string

  async save() {
    const name = this.constructor.name
    const key = `${name}/${this.id}.json`
    const content = JSON.stringify(this)
    return new S3.WriteFile(bucketName, key, content).execute()
  }
}
