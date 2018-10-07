module.exports.test = () => {
  return {
    REGION: 'eu-central-1',
    STAGE: 'test',
    LAMBDA_TIMEOUT: '300',
    LAMBDA_MEMORY_SIZE: '1536',

    // PROXY_USER: 'proxyuser',
    // PROXY_PASSWORD: '4kmLfk2j4?',
  }
}

module.exports.prod = () => {
  return {
    REGION: 'eu-central-1',
    STAGE: 'prod',
    LAMBDA_TIMEOUT: '300',
    LAMBDA_MEMORY_SIZE: '1536',

    // PROXY_USER: 'proxyuser',
    // PROXY_PASSWORD: '5kmLfk2j5!',
  }
}
