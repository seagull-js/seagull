// import 'reflect-metadata'

export default function field(target: any, key: string) {
  // todo: read a decorator value, it might be a index (GSI)
  // const t = Reflect.getMetadata('design:type', target, key)
  // console.log(`${key} type: ${t.name}`, target)
}

/*
 * note to myself: EVERY decorator will do, no matter what it does ...
 */
