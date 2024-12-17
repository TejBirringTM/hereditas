import {
  traverseGraphBreadthFirst,
  VisitContext,
} from "../../../../../../common/graph-computation/traverse-graph.ts";
import { TransformationStepOutput, declareTransformationStep } from "../../../../../../common/transformation-pipeline.ts";
import { InvalidDeclarationError, MissingDeclarationError, ProcessingFailedError } from "../../../../../../errors/parse-ft.ts";
import DevelopContext from "./1-develop-context.ts";
import { NPerson } from "./libs/context/types.ts";
import {
  isLeafNode,
  isRootNode,
  nextGeneration,
  ownGeneration,
  previousGeneration,
} from "./libs/family-tree-traversal/neighbour-functions.ts";

// input type:
type Input = TransformationStepOutput<typeof DevelopContext>;

// setters
const assignGeneration = (node: NPerson, generation?: number) => {
  if (!node.generationInTree && typeof generation === "number") {
    node.generationInTree = generation;
  }
};

const beforeEnqueueTraverseDown = (
  context: VisitContext<NPerson>,
  from: string,
) => {
  const enqueuingNodes = context.currentNode.neighbours.new;

  enqueuingNodes.forEach((node) => {
    if (typeof context.currentNode.node.generationInTree === "number") {
      const nextGeneration = context.currentNode.node.generationInTree + 1;
      assignGeneration(node, nextGeneration);
      console.log(context.rootNode.identity);
    }
    console.debug(
      `enqueuing (from ${from}): ${node.identity} (${node.generationInTree})`,
    );
  });
};

const beforeEnqueueTraverseUp = (
  context: VisitContext<NPerson>,
  from: string,
) => {
  const enqueuingNodes = context.currentNode.neighbours.new;

  enqueuingNodes.forEach((node) => {
    if (typeof context.currentNode.node.generationInTree === "number") {
      const prevGeneration = context.currentNode.node.generationInTree - 1;
      assignGeneration(node, prevGeneration);
    }
    console.debug(
      `enqueuing (from ${from}): ${node.identity} (${node.generationInTree})`,
    );
  });
};

// the transformation:
export default declareTransformationStep(
  "traverse-tree-recursively-to-assign-generation-numbers",
  (input: Input) => {
    if (!input.nodes.persons.male.designatedRootAncestor) {
      throw MissingDeclarationError.create("a start declaration is required");
    }

    // find roots and leafs
    const allRoots = input.nodes.persons.all
      .filter((node) => isRootNode(input, node));
      
    const allLeafs = input.nodes.persons.all.filter((node) =>
      isLeafNode(input, node)
    );

    if (!allRoots.includes(input.nodes.persons.male.designatedRootAncestor)) {
      throw InvalidDeclarationError.create("a start declaration must designate the first recorded male of any patrilineage");
    }

    // the primary root is the male that is asserted as root of the tree
    const primaryRoot = input.nodes.persons.male.designatedRootAncestor;

    // assert for the primary root a generation number of 1
    primaryRoot.generationInTree = 1;


    // initial traversal to assign generation numbers from primary root
    traverseGraphBreadthFirst(
      primaryRoot as NPerson,
      (node) => nextGeneration(input, node),
      {
        beforeEnqueue: (context) =>
          beforeEnqueueTraverseDown(context, "primary root"),
        visit(context) {
          console.debug(
            `visiting (from primary root): ${context.currentNode.node.identity}`,
          );
          const contemporaries = ownGeneration(input, context.currentNode.node);
          contemporaries.forEach((node) => {
            assignGeneration(node, context.currentNode.node.generationInTree);
          });
        },
      },
    );

    // loop until all nodes assigned generation number
    let iterationCount = 0;
    const MAX_ITERATIONS = 100;
    const getUnassignedNodes = () =>
      input.nodes.persons.all.filter((
        node,
      ) => (typeof node.generationInTree !== "number"));
    let unassignedNodes = getUnassignedNodes();
    while (unassignedNodes.length > 0 && iterationCount < MAX_ITERATIONS) {
      // traverse up from leaf nodes
      allLeafs.forEach((leaf) => {
        traverseGraphBreadthFirst(
          leaf,
          (node) => previousGeneration(input, node),
          {
            beforeEnqueue: (context) =>
              beforeEnqueueTraverseUp(context, "leaf"),
            visit(context) {
              console.debug(
                `visiting (from leaf): ${context.currentNode.node.identity}`,
              );
              if (context.currentNode.node.generationInTree) {
                const contemporaries = ownGeneration(
                  input,
                  context.currentNode.node,
                );
                contemporaries.forEach((node) => {
                  assignGeneration(node, context.currentNode.node.generationInTree);
                });
              }
            },
          },
        );
      });
      // traverse down from root nodes
      allRoots.forEach((root) => {
        traverseGraphBreadthFirst(
          root,
          (node) => nextGeneration(input, node),
          {
            beforeEnqueue: (context) =>
              beforeEnqueueTraverseDown(context, "root"),
            visit(context) {
              console.debug(
                `visiting (from root): ${context.currentNode.node.identity}`,
              );
              if (context.currentNode.node.generationInTree) {
                const contemporaries = ownGeneration(
                  input,
                  context.currentNode.node,
                );
                contemporaries.forEach((node) => {
                  assignGeneration(node, context.currentNode.node.generationInTree);
                });
              }
            },
          },
        );
      });
      // update loop context
      iterationCount++;
      unassignedNodes = getUnassignedNodes();
    }

    if (unassignedNodes.length > 0) {
      ProcessingFailedError.create('processing family tree timed out, probably due to complexity of input');
    }

    return input;
  },
);
