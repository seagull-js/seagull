export function addEnvFromFile(env: any, config: string) {
  const newEnv: any = {}
  Object.keys(env).forEach(key => (newEnv[key] = env[key]))
  const lines = config.split('\n')
  lines.forEach(line => addEnvVariable(line, newEnv))
  return newEnv
}

function addEnvVariable(line: string, env: any) {
  const key = line.substring(0, line.indexOf('='))
  const value = line.substring(line.indexOf('=') + 1)
  const keyIsValid = key !== undefined && key.length > 0
  const valueIsValid = value !== undefined && value.length > 0
  // tslint:disable-next-line:no-unused-expression
  keyIsValid && valueIsValid && (env[key] = value)
}
