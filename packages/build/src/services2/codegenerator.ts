import { LogEvent, OutputServiceEvents, ServiceEventBus } from './'

export const GenerateCodeEvent = Symbol('Start code generation Event')
export const GeneratedCodeEvent = Symbol('Code generation completed')
export interface CodeGeneratorServiceEvents extends OutputServiceEvents {
  [GenerateCodeEvent]: CodeGeneratorService['handleStartGeneration']
  [GeneratedCodeEvent]: () => void
}

export class CodeGeneratorService {
  bus: ServiceEventBus<CodeGeneratorServiceEvents>

  constructor(bus: CodeGeneratorService['bus']) {
    this.bus = bus.on(GenerateCodeEvent, this.handleStartGeneration.bind(this))
  }

  handleStartGeneration() {
    this.bus.emit(GeneratedCodeEvent)
  }
}
