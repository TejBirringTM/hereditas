import { type IToken } from "ebnf";
import { recursivelyFindOfType } from "../../../libs/grammar-parser/main.ts";
import { processStatement } from "./ast-sequence-parsers.ts";
import { type Graph } from "./graph.ts";

export default function transformAst(ast: IToken) {
    // create an empty graph to populate
    const graph : Graph = {
        nodes: [],
        links: []
    };

    // Step 1: deeply traverse AST to find statements,
    //         this works because there is only one scope.
    const statements = recursivelyFindOfType(ast, "STATEMENT");
    
    // Step 2: process each statement
    for (const token of statements) {
        processStatement(graph, token);
    }

    // return the populated graph
    return graph;
}
