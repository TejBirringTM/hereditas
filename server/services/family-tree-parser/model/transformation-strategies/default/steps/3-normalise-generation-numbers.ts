import { assert } from "@std/assert";
import {
  declareTransformationStep,
  TransformationStepOutput,
} from "../../../../../../libs/transformation-pipeline.ts";
import TraverseTreeRecursivelyToAssignGenerationNumbers from "./2-traverse-tree-recursively-to-assign-generation-numbers.ts";
import FamilyTreeParserTransformationPipelineErrors from "../../errors.ts";

type Input = TransformationStepOutput<
  typeof TraverseTreeRecursivelyToAssignGenerationNumbers
>;

export default declareTransformationStep(
  "normalise-generation-numbers",
  (input: Input) => {
    const generationNumbers = input.nodes.persons.all.map((node) =>
      node.generationInTree
    ).filter((gen) => (typeof gen === "number"));
    const minimumGenerationNumber = Math.min(...generationNumbers);
    if (minimumGenerationNumber < 1) {
      const delta = Math.abs(minimumGenerationNumber) + 1;
      input.nodes.persons.all.forEach((node) => {
        assert(typeof node.generationInTree === "number");
        node.generationInTree = node.generationInTree + delta;
      });
    }

    if (
      !input.nodes.persons.all.every((
        node,
      ) => (typeof node.generationInTree === "number" && node.generationInTree > 0))
    ) {
      throw FamilyTreeParserTransformationPipelineErrors.ProcessingFailed
        .create("Failed to normalise generation numbers");
    }

    // assign generation to marriage nodes
    input.nodes.marriages.all.forEach((node)=>{
      const groomIdentity = input.adjacencies.byMarriage.single.groom.get(node.identity);
      const brideIdentity = input.adjacencies.byMarriage.single.bride.get(node.identity);
      const groom = input.nodes.persons.male.$one(groomIdentity);
      const bride = input.nodes.persons.female.$one(brideIdentity);
      if (groom && bride && groom.generationInTree && bride.generationInTree) {
        node.generationInTree = groom.generationInTree;
      }
    })
    return input;
  },
);
