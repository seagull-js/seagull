export default class UUID {
  value: string = ''

  /**
   * load a pre-stored uuid into current state from localstorage
   */
  load(): void {
    this.value = window.localStorage.getItem('seagull-journey')
  }

  /**
   * save the current uuid to localstorage
   */
  save(): void {
    window.localStorage.setItem('seagull-journey', this.value)
  }

  /**
   * simple generation of an UUID based on Math.random.
   * good enough and stable for now.
   */
  create(): void {
    this.value = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // tslint:disable-next-line
      const r = (Math.random() * 16) | 0
      // tslint:disable-next-line
      const v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
