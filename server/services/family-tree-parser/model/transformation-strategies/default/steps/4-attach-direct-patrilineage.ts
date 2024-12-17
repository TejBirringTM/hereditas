import { assert } from "@std/assert";
  import { AnyNode, MaleIdentity} from "./libs/context/types.ts";
  import NormaliseGenerationNumbers from "./3-normalise-generation-numbers.ts";
  import { unresolveLink } from "./libs/context/main.ts";
  import { traverseGraphDepthFirst } from "../../../../../../common/graph-computation/traverse-graph.ts";
  import { declareTransformationStep, TransformationStepOutput } from "../../../../../../common/transformation-pipeline.ts";
  
  type Input = TransformationStepOutput<
    typeof NormaliseGenerationNumbers
  >;

  export default declareTransformationStep(
    "attach-direct-patrilineage",
    (input: Input) => {
      
      for (const n of input.nodes.persons.all) {
        // initialise referential subgraph
        n.patrilineage = {
          links: [],
          nodes: []
        };
        // traverse ancestors of the node
        traverseGraphDepthFirst(
          n as AnyNode,
          (node)=>{
            if (node.type==="Marriage") {
              const groomIdentity = input.adjacencies.byMarriage.single.groom.get(node.identity);
              const groom = input.nodes.persons.$one(groomIdentity);
              return [groom].filter((n)=>!!n);
            } else {
              const progenitorIdentity = input.adjacencies.byPerson.single.progenitor.get(node.identity);
              const adoptiveProgenitorIdentity = input.adjacencies.byPerson.single.adoptiveProgenitor.get(node.identity);
              return [progenitorIdentity, adoptiveProgenitorIdentity].map((n)=>input.nodes.marriages.$one(n)).filter((n)=>!!n)
            }
          },
          {
            visit(context) {
              if (context.currentNode.node.type === "Marriage") {
                // add marriage node
                n.patrilineage?.nodes.push(context.currentNode.node.identity);
                // add mother node
                const motherIdentity = input.adjacencies.byMarriage.single.bride.get(context.currentNode.node.identity);
                assert(motherIdentity);
                n.patrilineage?.nodes.push(motherIdentity);
              } else {
                // add nodes
                if (context.currentNode.node.identity !== n.identity) {
                  n.patrilineage?.nodes.push(context.currentNode.node.identity)
                }
                // add links
                const lProgeny = input.links.$one({type: "MaritalProgeny", toNodeIdentity: context.currentNode.node.identity});
                const lAdoptedProgeny = input.links.$one({type: "AdoptedMaritalProgeny", toNodeIdentity: context.currentNode.node.identity});
                if (lProgeny) {
                  n.patrilineage?.links.push(unresolveLink(lProgeny));
                }
                if (lAdoptedProgeny) {
                  n.patrilineage?.links.push(unresolveLink(lAdoptedProgeny));
                }
              }
            }
          }
        );

        n.generationInClan = n.patrilineage.nodes.filter((n)=>n.startsWith("male")).length + 1;
        const rootAncestor = (()=>{
          const tmp = n.patrilineage?.nodes?.[0];
          if (tmp && tmp.startsWith("male:")) {
            return input.nodes.persons.male.$one(tmp as MaleIdentity) ?? undefined;
          }
        })();
        n.rootAncestor = rootAncestor;
      }
      
      return input;
    },
  );
  