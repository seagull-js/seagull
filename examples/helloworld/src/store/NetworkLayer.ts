export class NetworkLayer {
  constructor(fetchFunct?: () => any) {
    this.fetchJson = fetchFunct || defaultFetchJson
  }
  fetchJson: () => any
}

const defaultFetchJson = async () => {
  const response = await fetch(
    'https://mdn.github.io/fetch-examples/fetch-json/products.json'
  )

  return await response.json()
}
