import { NPerson, PersonIdentity, PipelineContext } from "../context/types.ts";
import { unique } from "../../../../../../../../libs/collection-utils.ts";

// export interface NeighbourFunctionArguments {
//     findOneMale: GetNode<NMale>,
//     findManyPersons: GetNodes<NPerson>,
//     adjmapFather: AdjacencyMapSingular<PersonIdentity, MaleIdentity>,
//     adjmapAdoptiveFather: AdjacencyMapSingular<PersonIdentity, MaleIdentity>
//     adjmapChildren: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>,
//     adjmapAdoptedChildren: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>
// };

// // the parent from which the current node increments generation number
// export const generationTestatorParent = (args: NeighbourFunctionArguments, node: NPerson) => {
//     const {findOneMale: findOne, adjmapFather, adjmapAdoptiveFather} = args;
//     const father = findOne(adjmapFather.get(node.identity));
//     const adoptiveFather = findOne(adjmapAdoptiveFather.get(node.identity));
//     return father ?? adoptiveFather ?? null;
// }

// // the children that inherit generation number from the current node (so that it can be incremented)
// export  const generationHeirChildren = (args: NeighbourFunctionArguments, node: NPerson) => {
//     const {findManyPersons: findMany, adjmapChildren, adjmapAdoptedChildren} = args;
//     const allChildren = findMany(
//         ...adjmapChildren.get(node.identity)
//     );
//     const allAdoptedChildren = findMany(
//         ...adjmapAdoptedChildren.get(node.identity)
//     );
//     const generationSuccessorChildren = allChildren.filter((child)=>generationTestatorParent(args, child)?.identity === node.identity);
//     const generationSuccessorAdoptedChildren = allAdoptedChildren.filter((adoptedChild)=>generationTestatorParent(args, adoptedChild)?.identity === node.identity);
//     return [
//         ...generationSuccessorChildren,
//         ...generationSuccessorAdoptedChildren
//     ]
// }

// export const progenitorRelations = (context: PipelineContext, node: NPerson) => {
//     const findMany = context.nodes.marriages.$many;
//     const adjmapProgenitor = context.adjacencies.byPerson.single.progenitor;
//     const adjmapAdoptiveProgenitor = context.adjacencies.byPerson.single.adoptiveProgenitor;
//     const progenitor = adjmapProgenitor.get(node.identity);
//     const adoptiveProgenitor = adjmapAdoptiveProgenitor.get(node.identity);
//     return findMany(progenitor, adoptiveProgenitor);
// }

// export const progenyRelations = (context: PipelineContext, node: NPerson) => {
//     const findMany = context.nodes.marriages.$many;
//     const adjmapChildren = context.adjacencies.byPerson.multiple.children;
//     const adjmapAdoptedChildren = context.adjacencies.byPerson.multiple.adoptedChildren;
//     const adjmapMarriages = context.adjacencies.byPerson.multiple.marriages;
//     const children = adjmapChildren.get(node.identity);
//     const adoptedChildren = adjmapAdoptedChildren.get(node.identity);
//     const successors = [...children, ...adoptedChildren];
//     const successorsMarriages = successors.flatMap((successor)=>adjmapMarriages.get(successor));
//     return findMany(...successorsMarriages);
// }

// 'successor' is a child or adopted child
const successors = (context: PipelineContext, identity: PersonIdentity) => [
  ...context.adjacencies.byPerson.multiple.children.get(identity),
  ...context.adjacencies.byPerson.multiple.adoptedChildren.get(identity),
];

// 'testator' is a parent or adoptive parent
const testators = (context: PipelineContext, identity: PersonIdentity) => [
  ...context.adjacencies.byPerson.multiple.parents.get(identity),
  ...context.adjacencies.byPerson.multiple.adoptiveParents.get(identity),
];

// 'all sibling' include direct or adopted descendants of the same progenitor relationship, including the subject if specified
const allSiblings = (
  context: PipelineContext,
  identity: PersonIdentity,
  includeSelf = false,
) =>
  includeSelf
    ? [
      identity,
      ...context.adjacencies.byPerson.multiple.fullSiblings.get(identity),
      ...context.adjacencies.byPerson.multiple.fullSiblingsByAdoption.get(
        identity,
      ),
    ]
    : [
      ...context.adjacencies.byPerson.multiple.fullSiblings.get(identity),
      ...context.adjacencies.byPerson.multiple.fullSiblingsByAdoption.get(
        identity,
      ),
    ];

// 'spousal contemporaries' are spouses and their other spouses, including the subject if specified
const spousalContemporaries = (
  context: PipelineContext,
  identity: PersonIdentity,
  includeSelf = false,
) => {
  const spouses = context.adjacencies.byPerson.multiple.maritalSpouses.get(
    identity,
  );
  const spousesOtherSpouses = spouses.flatMap((identity) =>
    context.adjacencies.byPerson.multiple.maritalSpouses.get(identity)
  );
  if (includeSelf) {
    return [
      identity,
      ...spouses,
      ...spousesOtherSpouses,
    ];
  } else {
    return [
      ...spouses,
      ...spousesOtherSpouses,
    ];
  }
};

// 'parental contemporaries' are parents and their other spouses, and their siblings
const parentalContemporaries = (
  context: PipelineContext,
  identity: PersonIdentity,
) => {
  // parents
  const parents = context.adjacencies.byPerson.multiple.parents.get(identity);
  // parents other spouses
  const parentsAndTheirOtherSpouses = parents.flatMap((identity) =>
    spousalContemporaries(context, identity, true)
  );
  // all siblings of parents and their other spouses
  const parentalContemporaries = parentsAndTheirOtherSpouses.flatMap((
    identity,
  ) => allSiblings(context, identity, true));
  // return
  return parentalContemporaries;
};

export const nextGeneration = (context: PipelineContext, node: NPerson) => {
  const ownParentalContemporaries = parentalContemporaries(
    context,
    node.identity,
  );
  const ownSiblingContemporaries = ownParentalContemporaries.flatMap((
    identity,
  ) => successors(context, identity));
  const ownContemporaries = ownSiblingContemporaries.flatMap((identity) =>
    spousalContemporaries(context, identity, true)
  );

  const nextGenerationFromSelf = successors(context, node.identity);
  const nextGenerationFromOwnContemporaries = ownContemporaries.flatMap((
    identity,
  ) => successors(context, identity));
  const nextGeneration = unique([
    ...nextGenerationFromSelf,
    ...nextGenerationFromOwnContemporaries,
  ]);

  // return result
  const collect = context.nodes.persons.$many(...nextGeneration);
  return collect;
};

export const ownGeneration = (context: PipelineContext, node: NPerson) => {
  const ownParentalContemporaries = parentalContemporaries(
    context,
    node.identity,
  );
  const ownSiblingContemporaries = ownParentalContemporaries.flatMap((
    identity,
  ) => successors(context, identity));
  const ownContemporaries = ownSiblingContemporaries.flatMap((identity) =>
    spousalContemporaries(context, identity, true)
  );

  // return result
  const collect = context.nodes.persons.$many(...ownContemporaries);
  return collect;
};

export const previousGeneration = (context: PipelineContext, node: NPerson) => {
  const ownParentalContemporaries = parentalContemporaries(
    context,
    node.identity,
  );

  // return result
  const collect = context.nodes.persons.$many(...ownParentalContemporaries);
  return collect;
};

export const isRootNode = (context: PipelineContext, node: NPerson) => {
  const _testators = testators(context, node.identity);
  return (_testators.length === 0);
};

export const isLeafNode = (context: PipelineContext, node: NPerson) => {
  const _successors = successors(context, node.identity);
  return (_successors.length === 0);
};
