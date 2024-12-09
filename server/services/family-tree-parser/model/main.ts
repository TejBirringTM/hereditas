import {
  isRuntimeError,
  wrapRuntimeError,
} from "../../../common/runtime-error.ts";
import { createGrammarParserFromFile } from "../../../libs/grammar-parser/main.ts";
import { StrategyKeys } from "../../../libs/strategy-map.ts";
import { transformationPipelines } from "./transformation-strategies/main.ts";

interface parseFamilyTreeTextOptions {
  grammarFile: string;
  transformationStrategy: StrategyKeys<
    typeof transformationPipelines["strategies"]
  >;
}

export default async function parseFamilyTreeText(
  input: string,
  options: parseFamilyTreeTextOptions,
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
      throw wrapRuntimeError(e, "Failed to parse family tree");
    } else {
      throw e;
    }
  }
}
