import { IToken } from "ebnf";

export type Strategy<Output extends object> = (ast: IToken) => Output;
export type StrategyMap<Key extends string, Output extends object> = Record<Key, Output>;
