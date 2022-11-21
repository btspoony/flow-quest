export * as flow from "./flow";
export { default as Signer } from "./signer";

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
