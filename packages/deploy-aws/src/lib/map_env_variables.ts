export function mapEnvironmentVariables(variables: { [key: string]: string }) {
  const varEntries = Object.keys(variables)
  const mapEnv = (key: string) => ({ [key]: { value: variables[key] } })
  return Object.assign({}, ...varEntries.map(mapEnv))
}
