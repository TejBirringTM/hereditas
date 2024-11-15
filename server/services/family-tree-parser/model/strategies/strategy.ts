import { IToken } from "ebnf";

// a strategy converts an abstract syntax tree (AST) to a graph
export type Strategy<Output extends object> = (ast: IToken) => Output;
export const declareStrategy = <Output extends object>(strategy: Strategy<Output>) => strategy;

export type StrategyMap<Key extends string, Output extends object> = Record<Key, Output>;

// a strategy might contain any number of transformations, which are chained
export type TransformationFunction<Input extends object, Output extends object> = (input: Input) => Output;
export type Transformation<Title extends string, Input extends object, Output extends object> = {
    title: Title,
    fn: TransformationFunction<Input, Output>
}
export const declareTransformation = <Title extends string, Input extends object, Output extends object>(title: Title, transformation: TransformationFunction<Input, Output>) => ({
    title,
    fn: transformation
}) satisfies Transformation<Title, Input, Output>;


/**
 * Allows chaining of transformation functions.
 * 
 * @param input 
 * @returns 
 */
export function transform<Input extends object>(input: Input) {
    return {
        execute: function<Title extends string, Output extends object>(transformation: Transformation<Title, Input, Output>) {
            return transform(transformation.fn(input));
        },
        output: input,
    }
}


