import { KebabCase, PascalCase } from "type-fest";
import debugOnly from "./framework/debug-only.ts";

type WrapTitle<T, Title> = T & {
  title: Title;
};

/*
 *    A TransformationPipeline converts input argument of type Input to an output of type Output
 *    using any number of Tranformations that are executed sequentially in a chained manner
 */
export const declareTransformationPipeline =
  // deno-lint-ignore no-explicit-any
  <Title extends string, T extends Pipeline<any, any, any>>(
    title: PascalCase<Title>,
    ...transformationSteps: T
  ) =>
  (input: GetPipelineInput<T>): GetPipelineOutput<T> => {
    debugOnly(() => {
      console.debug(`Executing pipeline: ${title}`);
    });
    // deno-lint-ignore no-explicit-any
    let c: any = chain(input);
    for (const transformationStep of transformationSteps) {
      c = c.execute(transformationStep);
    }
    //
    debugOnly(() => {
      console.debug(`Done executing pipeline: ${title}`);
    });
    // return
    return c.result;
  };

/**
 * A TransformationStep represents a function that converts input of type Input into an output of type Output
 */
export type TransformationFn<Input, Output> = (input: Input) => Output;
export type TransformationStep<Input, Output, Title extends string> = WrapTitle<
  { fn: TransformationFn<Input, Output> },
  KebabCase<Title>
>;
export const declareTransformationStep = <Input, Output, Title extends string>(
  title: KebabCase<Title>,
  fn: TransformationFn<Input, Output>,
) =>
  ({
    title,
    fn,
  }) satisfies TransformationStep<Input, Output, Title>;

export type TransformationStepOutput<Candidate> = Candidate extends // deno-lint-ignore no-explicit-any
TransformationStep<any, infer O, any> ? O
  : never;

/**
 * Pipeline represents a sequential arragement of TranformationStep objects
 */
// deno-lint-ignore no-explicit-any
type Pipeline<Input, Output, Intermediate = any> = [
  TransformationStep<Input, Output, string>,
] | [
  TransformationStep<Input, Intermediate, string>,
  ...TransformationStep<Intermediate, Intermediate, string>[],
  TransformationStep<Intermediate, Output, string>,
];
// deno-lint-ignore no-explicit-any
type GetPipelineInput<P> = P extends Pipeline<infer I, any, any> ? I : never;
// deno-lint-ignore no-explicit-any
type GetPipelineOutput<P> = P extends Pipeline<any, infer O, any> ? O : never;

/**
 *  Allows chaining of Transformations
 */
function chain<Input>(input: Input, index = 0) {
  return {
    execute: <Output>(
      transformation: TransformationStep<Input, Output, string>,
    ) => {
      debugOnly(() => {
        console.debug(`[${index}] => ${transformation.title}`);
      });
      const result = transformation.fn(input);
      return chain(result, index + 1);
    },
    result: input,
  };
}
