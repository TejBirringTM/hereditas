import { NMale } from "./libs/context/types.ts";
import {
  declareTransformationStep,
  TransformationStepOutput,
} from "../../../../../../common/transformation-pipeline.ts";
import AttachDirectPatrilineage from "./4-attach-direct-patrilineage.ts";
import { NMarriage } from "./libs/context/types.ts";
import { NFemale } from "./libs/context/types.ts";
import { assert } from "@std/assert";
import { testators } from "./libs/family-tree-traversal/neighbour-functions.ts";

type Input = TransformationStepOutput<
  typeof AttachDirectPatrilineage
>;

export default declareTransformationStep(
  "attach-tree",
  (input: Input) => {
    type TreeNodeFemale = {
      identity: NFemale["identity"];
      title: string;
      text: string[];
      gender: "Female";
      marriages: TreeNodeMarriage[];
      generationInClan?: number;
      generationInTree?: number;
      attributes?: {
        redacted?: boolean;
      };
    };
    type TreeNodeMale = {
      identity: NMale["identity"];
      title: string;
      text: string[];
      gender: "Male";
      marriages: TreeNodeMarriage[];
      generationInClan?: number;
      generationInTree?: number;
      attributes?: {
        redacted?: boolean;
      };
    };
    type TreeNodeMarriage = NMarriage & {
      progeny: (TreeNodeFemale | TreeNodeMale)[];
      adoptedProgeny: (TreeNodeFemale | TreeNodeMale)[];
      groom: Omit<TreeNodeMale, "marriages" | "generationInClan">;
      bride: Omit<TreeNodeFemale, "marriages" | "generationInClan">;
    };

    const maleToTreeNode = (
      male: Input["nodes"]["persons"]["male"]["all"][0],
    ): TreeNodeMale => ({
      identity: male.identity,
      title: male.title,
      text: male.text,
      gender: "Male",
      marriages: [],
      generationInClan: male.generationInClan,
      generationInTree: male.generationInTree,
      attributes: male.attributes,
    });

    const femaleToTreeNode = (
      female: Input["nodes"]["persons"]["female"]["all"][0],
    ): TreeNodeFemale => ({
      identity: female.identity,
      title: female.title,
      text: female.text,
      gender: "Female",
      marriages: [],
      generationInClan: female.generationInClan,
      generationInTree: female.generationInTree,
      attributes: female.attributes,
    });

    const males = input.nodes.persons.male.all.map((male) =>
      maleToTreeNode(male)
    );
    const females = input.nodes.persons.female.all.map((female) =>
      femaleToTreeNode(female)
    );
    const persons = [...males, ...females];

    const marriages = input.nodes.marriages.all.map((marriage) => {
      const groomIdentity = input.adjacencies.byMarriage.single.groom.get(
        marriage.identity,
      );
      const groom = males.find((male) => male.identity === groomIdentity);
      assert(groom);
      const brideIdentity = input.adjacencies.byMarriage.single.bride.get(
        marriage.identity,
      );
      const bride = females.find((female) => female.identity === brideIdentity);
      assert(bride);
      const progeny = persons.filter((prog) => {
        const progenyIdentities = input.adjacencies.byMarriage.multiple.progeny
          .get(marriage.identity);
        return progenyIdentities.includes(prog.identity);
      });
      const adoptedProgeny = persons.filter((prog) => {
        const progenyIdentities = input.adjacencies.byMarriage.multiple
          .adoptedProgeny.get(marriage.identity);
        return progenyIdentities.includes(prog.identity);
      });
      const mrg = {
        ...marriage,
        progeny,
        adoptedProgeny,
        groom: {
          identity: groom.identity,
          title: groom.title,
          text: groom.text,
          gender: "Male",
        },
        bride: {
          identity: bride.identity,
          title: bride.title,
          text: bride.text,
          gender: "Female",
        },
      } satisfies TreeNodeMarriage;
      groom.marriages.push(mrg);
      bride.marriages.push(mrg);
      return mrg;
    });

    const tree: TreeNodeMale[] = males.filter((male) =>
      testators(input, male.identity).length === 0
    )
      .map((current) => {
        const marriageIdentities = input.adjacencies.byPerson.multiple.marriages
          .get(current.identity);
        const _marriages = marriages.filter((mrg) =>
          marriageIdentities.includes(mrg.identity)
        );
        return {
          ...current,
          marriages: _marriages,
        };
      });

    return {
      ...input,
      tree,
    };
  },
);
