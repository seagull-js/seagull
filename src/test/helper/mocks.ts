export function mockWindow() {
  const cache = {}
  ;(global as any).window = {
    analytics: true,
    document: {
      createElement: (...args) => args,
    },
    // tslint:disable-next-line
    ga: (...args) => {},
    localStorage: {
      cache,
      getItem: key => cache[key],
      setItem: (key, value) => (cache[key] = value),
    },
  }
}

export function mockFetch() {
  // tslint:disable-next-line
  ;(global as any).fetch = (...args) => {}
}

export function restoreWindow() {
  delete (global as any).window
}

export function restoreFetch() {
  delete (global as any).fetch
}
