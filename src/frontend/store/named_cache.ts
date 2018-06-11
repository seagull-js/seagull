export class NamedCache {
  private dict: { [name: string]: { [key: string]: any } } = {}

  get(name: string, ...args: any[]): any {
    const key = this.serialize(args)
    const dict = this.dict
    return dict[name] ? dict[name][key] : undefined
  }

  reset(name?: string): void {
    name ? (this.dict[name] = {}) : (this.dict = {})
  }

  set(name: string, value: any, ...args: any[]): any {
    const dict = this.dict
    const key = this.serialize(args)
    dict[name] ? (dict[name][key] = value) : (dict[name] = { [key]: value })
    return value
  }

  private serialize(args?: any) {
    return JSON.stringify(args)
  }
}
