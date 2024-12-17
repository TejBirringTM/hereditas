import { assert } from "@std/assert";
import {
  Adjacencies,
  FemaleIdentity,
  MaleIdentity,
  MarriageIdentity,
  PersonIdentity,
  PipelineContext,
} from "./types.ts";
import { AdjacencyMapMultiple, AdjacencyMapSingular } from "../../../../../../../../common/adjacency-map.ts";

export function developAdjacencies(
  context: Omit<PipelineContext, "adjacencies">,
) {
  const adjacencies = initialiseAdjacencies(
    context.nodes.persons.identities,
    context.nodes.marriages.identities,
  );
  populateAdjacencies(context, adjacencies);
  return adjacencies;
}

function initialiseAdjacencies(
  identitiesPeople: PersonIdentity[],
  identitiesMarriages: MarriageIdentity[],
): Adjacencies {
  const adjmapMarriages = new AdjacencyMapMultiple<
    PersonIdentity,
    MarriageIdentity
  >("Person => Marriages", identitiesPeople);

  const adjmapGroom = new AdjacencyMapSingular<MarriageIdentity, MaleIdentity>(
    "Marriage => Groom",
    identitiesMarriages,
  );
  const adjmapBride = new AdjacencyMapSingular<
    MarriageIdentity,
    FemaleIdentity
  >("Marriage => Bride", identitiesMarriages);

  const adjmapMaritalSpouses = new AdjacencyMapMultiple<
    PersonIdentity,
    PersonIdentity
  >("Person => Marital Spouse", identitiesPeople);

  const adjmapProgeny = new AdjacencyMapMultiple<
    MarriageIdentity,
    PersonIdentity
  >("Marriage => Progeny", identitiesMarriages);
  const adjmapAdoptedProgeny = new AdjacencyMapMultiple<
    MarriageIdentity,
    PersonIdentity
  >("Marriage => Adopted Progeny", identitiesMarriages);

  const adjmapProgenitor = new AdjacencyMapSingular<
    PersonIdentity,
    MarriageIdentity
  >("Person => Progenitor Marriage", identitiesPeople);
  const adjmapAdoptiveProgenitor = new AdjacencyMapSingular<
    PersonIdentity,
    MarriageIdentity
  >("Person => Adoptive Progenitor Marriage", identitiesPeople);

  const adjmapFather = new AdjacencyMapSingular<PersonIdentity, MaleIdentity>(
    "Person => Father",
    identitiesPeople,
  );
  const adjmapMother = new AdjacencyMapSingular<PersonIdentity, FemaleIdentity>(
    "Person => Mother",
    identitiesPeople,
  );
  const adjmapAdoptiveFather = new AdjacencyMapSingular<
    PersonIdentity,
    MaleIdentity
  >("Person => Adoptive Father", identitiesPeople);
  const adjmapAdoptiveMother = new AdjacencyMapSingular<
    PersonIdentity,
    FemaleIdentity
  >("Person => Adoptive Mother", identitiesPeople);

  const adjmapParents = new AdjacencyMapMultiple<
    PersonIdentity,
    PersonIdentity
  >("Person => Parents", identitiesPeople);
  const adjmapAdoptiveParents = new AdjacencyMapMultiple<
    PersonIdentity,
    PersonIdentity
  >("Person => Adoptive Parents", identitiesPeople);

  const adjmapChildren = new AdjacencyMapMultiple<
    PersonIdentity,
    PersonIdentity
  >("Person => Children", identitiesPeople);
  const adjmapAdoptedChildren = new AdjacencyMapMultiple<
    PersonIdentity,
    PersonIdentity
  >("Person => Adopted Children", identitiesPeople);

  const adjmapFullSiblings = new AdjacencyMapMultiple<
    PersonIdentity,
    PersonIdentity
  >("Person => Full Siblings", identitiesPeople);
  const adjmapAdoptiveFullSiblings = new AdjacencyMapMultiple<
    PersonIdentity,
    PersonIdentity
  >("Person => Adoptive Full Siblings", identitiesPeople);

  const adjacencies: Adjacencies = {
    byPerson: {
      single: {
        mother: adjmapMother,
        adoptiveMother: adjmapAdoptiveMother,
        father: adjmapFather,
        adoptiveFather: adjmapAdoptiveFather,
        progenitor: adjmapProgenitor,
        adoptiveProgenitor: adjmapAdoptiveProgenitor,
      },
      multiple: {
        parents: adjmapParents,
        adoptiveParents: adjmapAdoptiveParents,
        marriages: adjmapMarriages,
        maritalSpouses: adjmapMaritalSpouses,
        children: adjmapChildren,
        adoptedChildren: adjmapAdoptedChildren,
        fullSiblings: adjmapFullSiblings,
        fullSiblingsByAdoption: adjmapAdoptiveFullSiblings,
      },
    },
    byMarriage: {
      single: {
        groom: adjmapGroom,
        bride: adjmapBride,
      },
      multiple: {
        progeny: adjmapProgeny,
        adoptedProgeny: adjmapAdoptedProgeny,
      },
    },
  };

  return adjacencies;
}

function populateAdjacencies(
  context: Omit<PipelineContext, "adjacencies">,
  adjacencies: Adjacencies,
) {
  const link = context.links.$one;
  const links = context.links.$many;
  const nodesMarriages = context.nodes.marriages.all;
  const nodesPersons = context.nodes.persons.all;

  const adjmapMarriages = adjacencies.byPerson.multiple.marriages;
  const adjmapMaritalSpouses = adjacencies.byPerson.multiple.maritalSpouses;
  const adjmapGroom = adjacencies.byMarriage.single.groom;
  const adjmapBride = adjacencies.byMarriage.single.bride;

  const adjmapProgeny = adjacencies.byMarriage.multiple.progeny;
  const adjmapAdoptedProgeny = adjacencies.byMarriage.multiple.adoptedProgeny;

  const adjmapProgenitor = adjacencies.byPerson.single.progenitor;
  const adjmapAdoptiveProgenitor =
    adjacencies.byPerson.single.adoptiveProgenitor;

  const adjmapMother = adjacencies.byPerson.single.mother;
  const adjmapFather = adjacencies.byPerson.single.father;

  const adjmapAdoptiveMother = adjacencies.byPerson.single.adoptiveMother;
  const adjmapAdoptiveFather = adjacencies.byPerson.single.adoptiveFather;

  const adjmapParents = adjacencies.byPerson.multiple.parents;
  const adjmapChildren = adjacencies.byPerson.multiple.children;

  const adjmapAdoptiveParents = adjacencies.byPerson.multiple.adoptiveParents;
  const adjmapAdoptedChildren = adjacencies.byPerson.multiple.adoptedChildren;

  const adjmapFullSiblings = adjacencies.byPerson.multiple.fullSiblings;
  const adjmapAdoptiveFullSiblings =
    adjacencies.byPerson.multiple.fullSiblingsByAdoption;

  // populate adjacency maps - from marriages (pass #1)
  {
    for (const nodeMarriage of nodesMarriages) {
      const linkBride = link({
        type: "Bride",
        fromNodeIdentity: nodeMarriage.identity,
      });
      assert(linkBride);
      const linkGroom = link({
        type: "Groom",
        fromNodeIdentity: nodeMarriage.identity,
      });
      assert(linkGroom);
      const bride = linkBride.to;
      const groom = linkGroom.to;
      // add entries for person->marriages, marriage->groom, marriage->bride
      adjmapMarriages.set(groom.identity, nodeMarriage.identity);
      adjmapMarriages.set(bride.identity, nodeMarriage.identity);
      adjmapGroom.set(nodeMarriage.identity, groom.identity);
      adjmapBride.set(nodeMarriage.identity, bride.identity);
      // add entries for person->martial spouse
      adjmapMaritalSpouses.set(groom.identity, bride.identity);
      adjmapMaritalSpouses.set(bride.identity, groom.identity);
      // add entries for marital progeny
      const linksProgeny = links({
        type: "MaritalProgeny",
        fromNodeIdentity: nodeMarriage.identity,
      });
      for (const linkProgeny of linksProgeny) {
        const progeny = linkProgeny.to;

        adjmapProgeny.set(nodeMarriage.identity, progeny.identity);

        adjmapProgenitor.set(progeny.identity, nodeMarriage.identity);

        adjmapMother.set(progeny.identity, bride.identity);
        adjmapParents.set(progeny.identity, bride.identity);

        adjmapFather.set(progeny.identity, groom.identity);
        adjmapParents.set(progeny.identity, groom.identity);

        adjmapChildren.set(bride.identity, progeny.identity);
        adjmapChildren.set(groom.identity, progeny.identity);
      }
      // add entries for adopted marital progeny
      const linksAdoptedProgeny = links({
        type: "AdoptedMaritalProgeny",
        fromNodeIdentity: nodeMarriage.identity,
      });
      for (const linkAdoptedProgeny of linksAdoptedProgeny) {
        const adoptedProgeny = linkAdoptedProgeny.to;

        adjmapAdoptedProgeny.set(
          nodeMarriage.identity,
          adoptedProgeny.identity,
        );
        adjmapAdoptiveProgenitor.set(
          adoptedProgeny.identity,
          nodeMarriage.identity,
        );

        adjmapAdoptiveMother.set(adoptedProgeny.identity, bride.identity);
        adjmapAdoptiveParents.set(adoptedProgeny.identity, bride.identity);

        adjmapAdoptiveFather.set(adoptedProgeny.identity, groom.identity);
        adjmapAdoptiveParents.set(adoptedProgeny.identity, groom.identity);

        adjmapAdoptedChildren.set(bride.identity, adoptedProgeny.identity);
        adjmapAdoptedChildren.set(groom.identity, adoptedProgeny.identity);
      }
    }
  }

  // populate adjacency maps - from individuals (pass #1)
  {
    for (const nodePerson of nodesPersons) {
      // populate adopted children (since children may be adopted independently, outside of marriage)
      const linksAdoptedChild = links({
        type: "AdoptedChild",
        fromNodeIdentity: nodePerson.identity,
      });
      for (const linkAdoptedChild of linksAdoptedChild) {
        const adoptedChild = linkAdoptedChild.to;

        adjmapAdoptedChildren.set(nodePerson.identity, adoptedChild.identity);

        adjmapAdoptiveParents.set(adoptedChild.identity, nodePerson.identity);

        if (nodePerson.type === "Female") {
          adjmapAdoptiveMother.set(adoptedChild.identity, nodePerson.identity);
        } else if (nodePerson.type === "Male") {
          adjmapAdoptiveFather.set(adoptedChild.identity, nodePerson.identity);
        }
      }
    }
  }

  // populate adjacency maps - from marriages (pass #2)
  {
    for (const nodeMarriage of nodesMarriages) {
      const progeny = adjmapProgeny.get(nodeMarriage.identity);
      const adoptedProgeny = adjmapAdoptedProgeny.get(nodeMarriage.identity);
      // populate for progeny
      for (const p of progeny) {
        const otherChildrenOfParents = progeny.filter((_p) => _p !== p);
        const adoptedChildrenOfParents = adoptedProgeny;
        adjmapFullSiblings.set(p, ...otherChildrenOfParents);
        adjmapAdoptiveFullSiblings.set(p, ...adoptedChildrenOfParents);
      }
      // populate for adopted progeny
      for (const ap of adoptedProgeny) {
        const childrenOfParents = progeny;
        const otherAdoptedChildrenOfParents = adoptedProgeny.filter((_ap) =>
          _ap !== ap
        );
        adjmapAdoptiveFullSiblings.set(
          ap,
          ...childrenOfParents,
          ...otherAdoptedChildrenOfParents,
        );
      }
    }
  }
}
