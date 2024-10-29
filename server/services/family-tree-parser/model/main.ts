import { wrapRuntimeError, RuntimeError } from "../../../common/runtime-error.ts";
import { createGrammarParserFromFile } from "../../../libs/grammar-parser/main.ts";
import transformAst from "./transform-ast.ts";

const familyTreeParser = await createGrammarParserFromFile("services/family-tree-parser/ebnf.ebnf");

export default function parseFamilyTree(input: string) {
    try {
        // 1. parse text file to abstract syntax tree (AST)
        const ast = familyTreeParser.parse(input);
        // 2. transform AST to a node-link graph
        const graph = transformAst(ast);
        return graph;
    } catch (e) {
        if (e instanceof RuntimeError) {
            throw wrapRuntimeError(e, "Failed to parse family tree:");
        } else {
            throw e;
        } 
    }
}
