import {
  declareTransformationStep,
  TransformationStepOutput,
} from "../../../../../../common/transformation-pipeline.ts";
import NormaliseGenerationNumbers from "./3-normalise-generation-numbers.ts";
import { AnyNode } from "./libs/context/types.ts";

type Input = TransformationStepOutput<
  typeof NormaliseGenerationNumbers
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
      ) => (["Groom", "Bride", "MaritalProgeny", "AdoptedMaritalProgeny"]
        .includes(link.type))
      )
      .map((link) => ({
        fromNodeIdentity: link.fromNodeIdentity,
        toNodeIdentity: link.toNodeIdentity,
        type: link.type,
      }));
    const output = {
      nodes,
      links,
    };
    return output;
  },
);
