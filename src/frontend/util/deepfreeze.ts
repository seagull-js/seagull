/** @module Frontend */
export function deepFreeze(o: any) {
  Object.freeze(o)
  Object.getOwnPropertyNames(o).forEach((prop: string) => {
    if (
      o.hasOwnProperty(prop) &&
      o[prop] !== null &&
      (typeof o[prop] === 'object' || typeof o[prop] === 'function') &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop])
    }
  })
  return o
}
