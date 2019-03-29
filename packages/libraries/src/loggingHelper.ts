export function getRandomSequenceToken() {
  let token = ''
  for (let i = 0; i < 56; i++) {
    const x = Math.floor(Math.random() * 10)
    token = `${token}${x}`
  }

  return token
}
