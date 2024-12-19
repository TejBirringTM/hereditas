import { createGrammarParserFromFile } from "../../../common/grammar-parser/main.ts";
import { StrategyKeys } from "../../../common/strategy-map.ts";
import { InvalidGrammarError, InvalidInputError } from "../../../errors/grammar-parser.ts";
import { isRuntimeError, wrapRuntimeError } from "../../../errors/runtime-error.ts";
import { transformationPipelines } from "./transformation-strategies/main.ts";

interface ParseFamilyTreeTextOptions {
  grammarFile: string;
  transformationStrategy: StrategyKeys<
    typeof transformationPipelines["strategies"]
  >;
}

export default async function parseFamilyTreeText(
  input: string,
  options: ParseFamilyTreeTextOptions,
) {
  try {
    // 1. load the grammar file
    const familyTreeTextParser = await createGrammarParserFromFile(
      options.grammarFile,
    );
    // 2. parse text file to abstract syntax tree (AST)
    const ast = familyTreeTextParser.parse(input);
    // 3. select appropriate pipeline for transformation of AST
    const pipeline = transformationPipelines.getStrategy(
      options.transformationStrategy,
    );
    // 4. run the transformation pipeline and return output
    const output = pipeline(ast);
    return output;
  } catch (e) {
    if (isRuntimeError(e)) {
      if (InvalidGrammarError.is(e) || InvalidInputError.is(e)) {
        console.error(e);
        throw InvalidInputError.create("Failed to parse family tree");
      }
      throw wrapRuntimeError(e, "Failed to parse family tree");
    } else {
      throw e;
    }
  }
}
