import { type IToken } from "ebnf";
import { declareStrategy, transform } from "../strategy.ts";
import parseAst from "../../parse-ast/index.ts";
import { graphFromFamilyTreeContext } from "./graph.ts";
import assignGenerationNumbers from "./graph-transformations/assign-generation-numbers.ts";
import filterNodesAndLinks from "./graph-transformations/filter-nodes-links.ts";
import appendSummaryProps from "./graph-transformations/append-summary-props.ts";
import generateShallowAdjacencyMaps from "./graph-transformations/generate-shallow-adjacency-maps.ts";

export default declareStrategy((ast: IToken)=>{
    // parse AST
    const familyTreeContext = parseAst(ast);

    // initialise basic graph
    const startGraph = graphFromFamilyTreeContext(familyTreeContext);

    // perform transformations on the graph
    const transformedGraph = transform(startGraph)
        .execute(generateShallowAdjacencyMaps)
        .execute(assignGenerationNumbers)
        // .execute(appendSummaryProps)
        .execute(filterNodesAndLinks)
        .output;

    // return the populated graph.
    return transformedGraph;
});
