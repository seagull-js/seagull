import { memoize } from './decorators'

/**
 * Basic Building Block to aggregate pure functions into a class with static
 * methods. The majority of your business logic should reside within Library
 * classes.
 * Static function have advantages over free first-class functions
 * because they can be decorated for optimizations like memoization.
 */
export class Library {}
