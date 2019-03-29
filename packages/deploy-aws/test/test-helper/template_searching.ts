export function isInList(list: string[], ...toBeSearched: string[]) {
  return list.find(entry => searchInEntry(entry, toBeSearched)) !== undefined
}

export function searchInEntry(entry: string, toBeSearched: string[]) {
  const searchRes = toBeSearched.map(searched => entry.indexOf(searched) > -1)
  return searchRes.find(isInString => isInString === false) === undefined
}
