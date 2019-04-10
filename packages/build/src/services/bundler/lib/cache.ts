interface CacheKeyProps {
  optimized?: boolean
  compatible?: boolean
  node?: boolean
}
interface Cache {
  cache: object
  packageCache: object
}
const caches = [] as Array<CacheKeyProps & Cache>
const addCache = (props: CacheKeyProps) => {
  const cache = { ...props, cache: {}, packageCache: {} }
  caches.push(cache)
  return cache
}

export const getCacheRef = <T extends CacheKeyProps>(cacheKeyProps: T) => {
  const { compatible = false, node = false, optimized = false } = cacheKeyProps
  const cache = caches.find(
    item =>
      item.compatible === compatible &&
      item.node === node &&
      item.optimized === optimized
  )
  return cache ? cache : addCache({ compatible, optimized, node })
}
