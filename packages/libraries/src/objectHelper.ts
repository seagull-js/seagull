/**
 * Alternative for not yet existing ES7 null propagation operator.
 * @param obj Object to get value of
 * @param unsafeDataOperation Selector function which returns (sub-)property
 * @param valueIfFail Returned value in case any null check fails
 */
export const tryGet = <O, T>(
  obj: O,
  unsafeDataOperation: (x: O) => T,
  valueIfFail?: any
): T => {
  try {
    const result = unsafeDataOperation(obj)
    if (typeof result === 'undefined') {
      return valueIfFail
    } else {
      return result
    }
  } catch (error) {
    return valueIfFail
  }
}
