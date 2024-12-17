import * as v from "@valibot/valibot";
import { ValidationFailedError } from "../errors/validation.ts";

export function declareString<TName extends string>(
  name: TName,
  formatDescription: string,
  formatRegex: RegExp,
) {
  const schema = v.pipe(
    v.string(`${name} must be a string`),
    v.regex(
      formatRegex,
      `${name} is of incorrect format:\n${formatDescription}`,
    ),
  );
  return Object.freeze({
    name,
    schema,
    assert: makeAssertFunction(name, schema),
  });
}

export function declareNatural<TName extends string>(name: TName) {
  const schema = v.pipe(
    v.number(`${name} must be a natural number.`),
    v.integer(`${name} must be a natural number.`),
    v.minValue(1, `${name} must be a natural number.`),
  );
  return Object.freeze({
    name,
    schema,
    assert: makeAssertFunction(name, schema),
  });
}

export function makeAssertFunction<
  TName extends string,
  const TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
>(name: TName, schema: TSchema) {
  return function (input: unknown) {
    const result = v.safeParse(schema, input);
    if (result.success) {
      return result.output;
    } else {
      throw ValidationFailedError.create(
        `invalid ${name}: ${result.issues.map((issue) => issue.message)}`
      )
    }
  };
}
