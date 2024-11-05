import { wrapRuntimeError, RuntimeError } from "../../../common/runtime-error.ts";
import { createGrammarParserFromFile } from "../../../libs/grammar-parser/main.ts";
import { getStrategy, StrategyKey } from "./strategies/index.ts";

const familyTreeParser = await createGrammarParserFromFile("services/family-tree-parser/ebnf.ebnf");

export default function parseFamilyTree(input: string, strategy: StrategyKey) {
    try {
        // 1. parse text file to abstract syntax tree (AST)
        const ast = familyTreeParser.parse(input);
        // 2. transform AST to a node-link graph
        const output = getStrategy(strategy)(ast);
        return output;
    } catch (e) {
        if (e instanceof RuntimeError) {
            throw wrapRuntimeError(e, "Failed to parse family tree:");
        } else {
            throw e;
        } 
    }
}
