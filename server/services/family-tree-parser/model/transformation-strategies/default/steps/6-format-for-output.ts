import {
  declareTransformationStep,
  TransformationStepOutput,
} from "../../../../../../common/transformation-pipeline.ts";
import AttachTree from "./5-attach-tree.ts";
import { AnyNode } from "./libs/context/types.ts";
import { isRootNode } from "./libs/family-tree-traversal/neighbour-functions.ts";

type Input = TransformationStepOutput<
  typeof AttachTree
>;

type N = AnyNode & {
  children: N[];
};

export default declareTransformationStep(
  "format-for-output",
  (input: Input) => {
    const nodes = [
      ...input.nodes.persons.all,
      ...input.nodes.marriages.all,
    ];

    const links = input.links.all
      .filter((
        link,
      ) => (["Groom", "Bride", "MaritalProgeny", "AdoptedMaritalProgeny", "Child", "AdoptedChild", "Parent", "AdoptiveParent"]
        .includes(link.type))
      )
      .map((link) => ({
        fromNodeIdentity: link.fromNodeIdentity,
        toNodeIdentity: link.toNodeIdentity,
        type: link.type,
      }));

    const rootNodeIdentities = input.nodes.persons.all
          .filter((node) => node.type==="Male" && isRootNode(input, node))
          .map((node) => node.identity);

    const output = {
      nodes,
      links,
      stats: {
        rootNodes: rootNodeIdentities,
        nRootNodes: rootNodeIdentities.length
      },
      tree: input.tree
    };
    
    return output;
  },
);
