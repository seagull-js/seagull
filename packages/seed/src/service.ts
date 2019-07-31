import { injectable, optional } from 'inversify'
import 'reflect-metadata'
import { TestScope } from './testScope'

@injectable()
export abstract class SeedableService {
  constructor(@optional() protected testScope?: TestScope) {}
}
