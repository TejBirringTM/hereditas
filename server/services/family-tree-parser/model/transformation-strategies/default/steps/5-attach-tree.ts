import { NMale } from "./libs/context/types.ts";
import {
  declareTransformationStep,
  TransformationStepOutput,
} from "../../../../../../common/transformation-pipeline.ts";
import AttachDirectPatrilineage from "./4-attach-direct-patrilineage.ts";
import { isRootNode } from "./libs/family-tree-traversal/neighbour-functions.ts";
import { NMarriage } from "./libs/context/types.ts";
import { NFemale } from "./libs/context/types.ts";
import { assert } from "@std/assert";

type Input = TransformationStepOutput<
  typeof AttachDirectPatrilineage
>;

export default declareTransformationStep(
  "attach-tree",
  (input: Input) => {
    type TreeNodeFemale = NFemale & {
        marriages: TreeNodeMarriage[],
    };
    type TreeNodeMale = NMale & {
        marriages: TreeNodeMarriage[],
    };
    type TreeNodeMarriage = NMarriage & {
        progeny: (TreeNodeFemale | TreeNodeMale)[],
        adoptedProgeny: (TreeNodeFemale | TreeNodeMale)[],
        groom: Omit<TreeNodeMale, "marriages">,
        bride: Omit<TreeNodeFemale, "marriages">,
    };

    const maleToTreeNode = (male: NMale) : TreeNodeMale => ({
        ...male,
        marriages: []
    });

    const femaleToTreeNode = (female: NFemale) : TreeNodeFemale => ({
        ...female,
        marriages: []
    });

    const males = input.nodes.persons.male.all.map((male)=>maleToTreeNode(male));
    const females = input.nodes.persons.female.all.map((female)=>femaleToTreeNode(female));
    const persons = [...males, ...females];

    

    const marriages = input.nodes.marriages.all.map((marriage)=>{
        const groomIdentity = input.adjacencies.byMarriage.single.groom.get(marriage.identity);
        const groom = males.find((male)=>male.identity === groomIdentity);
        assert(groom);
        const brideIdentity = input.adjacencies.byMarriage.single.bride.get(marriage.identity);
        const bride = females.find((female)=>female.identity === brideIdentity);
        assert(bride);
        const progeny = persons.filter((prog)=>{
            const progenyIdentities = input.adjacencies.byMarriage.multiple.progeny.get(marriage.identity)
            return progenyIdentities.includes(prog.identity);
        });
        const adoptedProgeny = persons.filter((prog)=>{
            const progenyIdentities = input.adjacencies.byMarriage.multiple.adoptedProgeny.get(marriage.identity)
            return progenyIdentities.includes(prog.identity);
        });
        const mrg = {
            ...marriage,
            progeny,
            adoptedProgeny,
            groom: {
                identity: groom.identity,
                type: groom.type,
                title: groom.title,
                text: groom.text
            },
            bride: {
                identity: bride.identity,
                type: bride.type,
                title: bride.title,
                text: bride.text
            }
        };
        groom.marriages.push(mrg);
        bride.marriages.push(mrg);
        return mrg;
    });

    const tree : TreeNodeMale[] = males.filter((male)=>isRootNode(input, male))
    .map((current)=>{
        const marriageIdentities = input.adjacencies.byPerson.multiple.marriages.get((current.identity));
        const _marriages = marriages.filter((mrg)=>marriageIdentities.includes(mrg.identity));
        return {
            ...current,
            marriages: _marriages
        }
    });


    return {
        ...input,
        tree
    };
  },
);
