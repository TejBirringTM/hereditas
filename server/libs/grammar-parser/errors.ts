import { declareRuntimeError } from "../../common/runtime-error.ts";

const grammarParserErrors = {
  InvalidGrammarSpec: declareRuntimeError(
    "GrammarParserInvalidGrammarSpecification",
  ),
  InvalidInputText: declareRuntimeError("GrammarParserInvalidInputText"),
  ItemNotFound: declareRuntimeError("GrammarParserItemNotFound"),
} as const;

export default grammarParserErrors;
