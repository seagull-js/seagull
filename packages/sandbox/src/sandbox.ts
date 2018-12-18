export type IContainer = {
  reset(): void
}
/**
 * Global singleton for registering sandboxes (i.e. mocks).
 * One of the use cases is to enable auto mocking for commands in tests. Because commands are about side effects they need a "global" state in order to build their actions on to each other. However tests need to be able to run isolated one after another.
 * It is therefore required to have this Sandbox object which enables Commands to register their sandboxes so every Test inheriting from BasicTests is able to reset the sandbox for each test.
 */
export const Sandbox = {
  /**
   * Mock holder
   */
  container: [] as IContainer[],
  /**
   * Registers a sandbox with the global sandbox
   */
  register(c: IContainer) {
    this.container.push(c)
  },
  /**
   * resets all registered sandboxes
   */
  reset() {
    this.container.forEach(c => c.reset())
  },
}
