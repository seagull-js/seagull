export const seedGlobalHookScript = <T>(fixture: T): T => {
  if (Array.isArray(fixture)) {
    // cut all after first 2
    return fixture.slice(0, 2) as any
  } else {
    return fixture
  }
}
