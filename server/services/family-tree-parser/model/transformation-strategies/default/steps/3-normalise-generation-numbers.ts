import { assert } from "@std/assert";
import AssignGenerationNumbers from "./2-assign-generation-numbers.ts";
import {
  declareTransformationStep,
  TransformationStepOutput,
} from "../../../../../../common/transformation-pipeline.ts";
import { ProcessingFailedError } from "../../../../../../errors/parse-ft.ts";
import { NPerson } from "./libs/context/types.ts";

type Input = TransformationStepOutput<
  typeof AssignGenerationNumbers
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
      ) => (typeof node.generationInTree === "number" &&
        node.generationInTree > 0)
      )
    ) {
      throw ProcessingFailedError.create(
        "failed to normalise generation numbers",
      );
    }

    // assign generation to marriage nodes
    input.nodes.marriages.all.forEach((node) => {
      const groomIdentity = input.adjacencies.byMarriage.single.groom.get(
        node.identity,
      );
      const brideIdentity = input.adjacencies.byMarriage.single.bride.get(
        node.identity,
      );
      const groom = input.nodes.persons.male.$one(groomIdentity);
      const bride = input.nodes.persons.female.$one(brideIdentity);
      if (groom && bride && groom.generationInTree && bride.generationInTree) {
        node.generationInTree = groom.generationInTree;
      }
    });

    // ensure adopted children use the lowest possible generation number of all adoptees (i.e. in the case of generations elder than parents adopting child)
    input.nodes.persons.all.forEach((node) => {
      const adoptedChildrenIdentities = input.adjacencies.byPerson.multiple
        .adoptedChildren.get(node.identity);
      const adoptedChildren = input.nodes.persons.$many(
        ...adoptedChildrenIdentities,
      ).filter((_node) =>
        _node.generationInTree
      ) as (NPerson & { generationInTree: number })[];
      const lowestGenerationNumber = Math.min(
        ...adoptedChildren.map((_node) => _node.generationInTree),
      );
      adoptedChildren.forEach((_node) => {
        _node.generationInTree = lowestGenerationNumber;
      });
    });

    return input;
  },
);
