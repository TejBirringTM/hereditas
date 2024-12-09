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
      node.generation
    ).filter((gen) => (typeof gen === "number"));
    const minimumGenerationNumber = Math.min(...generationNumbers);
    if (minimumGenerationNumber < 1) {
      const delta = Math.abs(minimumGenerationNumber) + 1;
      input.nodes.persons.all.forEach((node) => {
        assert(typeof node.generation === "number");
        node.generation = node.generation + delta;
      });
    }

    if (
      !input.nodes.persons.all.every((
        node,
      ) => (typeof node.generation === "number" && node.generation > 0))
    ) {
      throw FamilyTreeParserTransformationPipelineErrors.ProcessingFailed
        .create("Failed to normalise generation numbers");
    }

    return input;
  },
);
