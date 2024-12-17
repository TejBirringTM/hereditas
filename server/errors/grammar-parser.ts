import { declareRuntimeError } from "./runtime-error.ts";

export const InvalidGrammarError = declareRuntimeError("GrammarParser:InvalidGrammar");
export const InvalidInputError = declareRuntimeError("GrammarParser:InvalidInput");
// export const InvalidInputError = declareRuntimeError("GrammarParser:InvalidInput");