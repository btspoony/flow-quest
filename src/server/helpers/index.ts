export * as flow from "./flow";

/**
 * assert
 * @param anyToCheck
 * @param message
 * @returns
 */
export function assert(anyToCheck: boolean, message: string): boolean {
  if (!anyToCheck) {
    throw new Error(message);
  }
  return true;
}
