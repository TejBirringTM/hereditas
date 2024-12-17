import { IToken } from "ebnf";
import { FamilyTreeContext } from "./types.ts";
import { processStatement } from "./statement-processor.ts";
import { recursivelyFindOfType } from "../../../../../common/grammar-parser/main.ts";

export default function parseAstToFamilyTreeContext(ast: IToken) {
  // Step 1: initialise context
  const context: FamilyTreeContext = {
    maleNodes: new Map(),
    femaleNodes: new Map(),
    marriageNodes: new Map(),
    links: [],
    startNode: null,
  };

  // Step 2: deeply traverse AST to find statements,
  //         this works because there is only one top-level scope to traverse for statements.
  const statements = recursivelyFindOfType(ast, "STATEMENT");

  // Step 3: process each statement to populate (and adjust) the context
  //         based on the sequential/chronological execution of the statements.
  for (const token of statements) {
    processStatement(context, token);
  }

  // Step 4: return the context
  return context;
}
