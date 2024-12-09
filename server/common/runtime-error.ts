import { PascalCase } from "type-fest";

class RuntimeErrorImplementation extends Error {
  override readonly name;

  constructor(name: string, message?: string) {
    super(message);
    this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export type RuntimeError = RuntimeErrorImplementation;

/**
 * **Declare a Runtime Error**
 *
 * `RuntimeError` instances represent errors that occur during execution of "internal code" -
 * these instances aim to represent and contextualise erroneous/unexpected occurences, particularly useful when the error bubbles
 * up to the API handler function.
 *
 * @param name of this type of error
 * @returns a generator function that creates this type of error
 */
export function declareRuntimeError<Name extends string>(
  name: PascalCase<Name>,
) {
  return Object.freeze({
    create: (message?: string) => new RuntimeErrorImplementation(name, message),
    validate: (error?: { name?: unknown }) =>
      error?.name && typeof error.name === "string" && error.name === name,
  });
}

/**
 * **Wrap a Runtime Error**
 *
 * Envelops a `RuntimeError` by appending a prefix to provide additional context.
 *
 * @param error the `RuntimeError` to envelop
 * @param prefix the string to append to the existing error message
 * @returns a reference to the same `RuntimeError` but now with the prefix appended
 */
export function wrapRuntimeError(error: RuntimeError, prefix: string) {
  error.message = `${prefix}: ${error.message}`;
  return error;
}

export function isRuntimeError<T>(candidate: T) {
  return (candidate instanceof RuntimeErrorImplementation);
}
