/** @module Tools */
export class Worker {
  constructor(public srcFolder: string) {}

  async onFileCreated(filePath: string): Promise<void> {
    return
  }

  async onFileChanged(filePath: string): Promise<void> {
    return
  }

  async onFileRemoved(filePath: string): Promise<void> {
    return
  }

  async watcherWillStart(): Promise<void> {
    return
  }

  async watcherDidStart(): Promise<void> {
    return
  }

  async watcherWillStop(): Promise<void> {
    return
  }

  async watcherDidStop(): Promise<void> {
    return
  }
}
