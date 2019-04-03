export function getRandomSequenceToken() {
  let token = ''
  for (let i = 0; i < 56; i++) {
    const x = Math.floor(Math.random() * 10)
    token = `${token}${x}`
  }

  return token
}

export async function sendLog(logRoute: string, log: object) {
  const rawResponse = await fetch(logRoute, {
    body: JSON.stringify(log),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  return await rawResponse.json()
}
