export function getRandomSequenceToken() {
  let token = ''
  for (let i = 0; i < 56; i++) {
    const x = Math.floor(Math.random() * 10)
    token = `${token}${x}`
  }

  return token
}

// helper function for sending logs to the logging route
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

// helper function for getting logs in the frontend
export async function getLog(logRoute: string, log: object) {
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
