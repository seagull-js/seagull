import { S3 } from '@seagull/commands-s3'
import { config } from './config'

export abstract class Item {
  // get all instances of a given Item subclass
  static async all<T extends Item>(this: new (...args: any[]) => T) {
    const name = this.name
    const keys: string[] = await new S3.ListFiles(config.bucket, name).execute()
    return await Promise.all(
      keys.map(async key => {
        const data = await loadJSONFile(key)
        return Object.assign(Object.create(this.prototype), data) as T
      })
    )
  }

  // delete an existing object from the database
  static async delete<T extends Item>(
    this: new (...args: any[]) => T,
    id: string
  ) {
    const name = this.name
    const key = `${name}/${id}.json`
    return await new S3.DeleteFile(config.bucket, key).execute()
  }

  // delete all objects of specified Item from the database
  static async deleteAll<T extends Item>(this: new (...args: any[]) => T) {
    const name = this.name
    const keys = await new S3.ListFiles(config.bucket, name).execute()

    for (const key of keys) {
      await new S3.DeleteFile(config.bucket, key).execute()
    }
  }

  // Fetch an object from the database by id
  static async get<T extends Item>(
    this: new (...args: any[]) => T,
    id: string
  ) {
    const name = this.name
    const key = `${name}/${id}.json`
    const data = await loadJSONFile(key)
    return Object.assign(Object.create(this.prototype), data) as T
  }

  // Fetch all objects from database where ids matching the pattern
  static async query<T extends Item>(
    this: new (...args: any[]) => T,
    pattern: string
  ) {
    const matches = []
    const name = this.name
    const regexp = new RegExp(pattern, 'gi')
    const keys: string[] = await new S3.ListFiles(config.bucket, name).execute()

    for (const key of keys) {
      if (key.match(regexp)) {
        matches.push(key)
      }
    }

    return await Promise.all(
      matches.map(async match => {
        const data = await loadJSONFile(match)
        return Object.assign(Object.create(this.prototype), data) as T
      })
    )
  }

  // directly create a new object from parameters, save it and then return it
  static async put<T extends Item>(
    this: new (...args: any[]) => T,
    data: Partial<T> & { id: string }
  ) {
    const instance = Object.assign(Object.create(this.prototype), data) as T
    return instance.save()
  }

  static async putAll<T extends Item>(
    this: new (...args: any[]) => T,
    data: Array<Partial<T> & { id: string }>
  ) {
    for (const item of data) {
      const instance = Object.assign(Object.create(this.prototype), item) as T
      await instance.save()
    }
  }

  static async filter<T extends Item>(
    this: new (...args: any[]) => T,
    filterObject: any
  ) {
    const name = this.name
    const keys: string[] = await new S3.ListFiles(config.bucket, name).execute()
    const promises = keys.map(async key => {
      let match = false
      const data = await loadJSONFile(key)

      for (const filterKey of Object.keys(filterObject)) {
        if (!data.hasOwnProperty(filterKey)) {
          return false
        }
        match = filterObject[filterKey] === data[filterKey]
      }
      return match && (Object.assign(Object.create(this.prototype), data) as T)
    })

    const result = await Promise.all(promises)
    return result.filter(item => item) as T[]
  }

  abstract id: string

  async save() {
    const name = this.constructor.name
    const key = `${name}/${this.id}.json`
    const content = JSON.stringify(this)
    return new S3.WriteFile(config.bucket, key, content).execute()
  }
}

// helper method for typescript's sake
async function loadJSONFile(key: string) {
  const content = await new S3.ReadFile(config.bucket, key).execute()
  if (content !== '') {
    return JSON.parse(content)
  } else {
    throw new Error(`Item with id '${key}' does not exist`)
  }
}
