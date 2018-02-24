export function mockWindow() {
  const cache = {}
  ;(global as any).window = {
    analytics: true,
    ga: (...args) => {},
    localStorage: {
      cache,
      getItem: key => cache[key],
      setItem: (key, value) => (cache[key] = value),
    },
    document: {
      createElement: (...args) => args,
    },
  }
}

export function mockFetch() {
  ;(global as any).fetch = (...args) => {}
}

export function restoreWindow() {
  delete (global as any)['window']
}

export function restoreFetch() {
  delete (global as any)['fetch']
}
