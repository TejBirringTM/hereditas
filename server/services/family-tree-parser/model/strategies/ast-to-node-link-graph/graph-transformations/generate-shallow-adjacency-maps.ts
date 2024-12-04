import { assert } from "@std/assert";
import { declareTransformation } from "../../strategy.ts";
import { Graph } from "../graph.ts";
import { AdjacencyMapMultiple, AdjacencyMapSingular } from "../../../../../../libs/adjacency-map.ts";
import { LAdoptedChild, LAdoptedMaritalProgeny, LBride, LGroom, LMaritalProgeny } from "../../../parse-ast/types.ts";

export default declareTransformation("Generate shallow adjacency maps", (graph: Graph)=>{
    const nodesMale =  graph.nodes.filter((node)=>(node.type === "Male"));
    const nodesFemale =  graph.nodes.filter((node)=>(node.type === "Female"));
    const nodesPerson =  graph.nodes.filter((node)=>(node.type === "Male" || node.type === "Female"));
    const nodesMarriage = graph.nodes.filter((node)=>(node.type === "Marriage"));
    type NPerson = typeof nodesPerson[0];
    type NMale = NPerson & { type: "Male" };
    type NFemale = NPerson & { type: "Female" };
    type NMarriage = typeof nodesMarriage[0];
    type PersonIdentity = NPerson["identity"];
    type MaleIdentity = NMale["identity"];
    type FemaleIdentity = NFemale["identity"];
    type MarriageIdentity = NMarriage["identity"];
    const getMaleNode = (identity: NMale["identity"]) => (nodesMale.find((person)=>person.identity === identity));
    const getFemaleNode = (identity: NFemale["identity"]) => (nodesFemale.find((person)=>person.identity === identity));
    const getPersonNode = (identity: NPerson["identity"]) => (nodesPerson.find((person)=>person.identity === identity));
    const getMarriageNode = (identity: NMarriage["identity"]) => (nodesMarriage.find((marriage)=>marriage.identity === identity));
    type Nullable<T> = T | null;
    const identitiesPerson = nodesPerson.map((nodePerson)=>nodePerson.identity);
    const identitiesMarriage = nodesMarriage.map((nodeMarriage)=>nodeMarriage.identity);

    // initialise adjacency maps
    const adjmapMarriages = new AdjacencyMapMultiple<PersonIdentity, MarriageIdentity>("Person => Marriages", identitiesPerson);
    const adjmapGroom = new AdjacencyMapSingular<MarriageIdentity, MaleIdentity>("Marriage => Groom", identitiesMarriage);
    const adjmapBride = new AdjacencyMapSingular<MarriageIdentity, FemaleIdentity>("Marriage => Bride", identitiesMarriage);

    const adjmapProgeny = new AdjacencyMapMultiple<MarriageIdentity, PersonIdentity>("Marriage => Progeny", identitiesMarriage);
    const adjmapAdoptedProgeny = new AdjacencyMapMultiple<MarriageIdentity, PersonIdentity>("Marriage => Adopted Progeny", identitiesMarriage);
    const adjmapProgenitor = new AdjacencyMapSingular<PersonIdentity, MarriageIdentity>("Person => Progenitor Marriage", identitiesPerson);
    const adjmapAdoptiveProgenitor = new AdjacencyMapSingular<PersonIdentity, MarriageIdentity>("Person => Adoptive Progenitor Marriage", identitiesPerson);

    const adjmapFather = new AdjacencyMapSingular<PersonIdentity, PersonIdentity>("Person => Father", identitiesPerson);
    const adjmapMother = new AdjacencyMapSingular<PersonIdentity, PersonIdentity>("Person => Mother", identitiesPerson);
    const adjmapAdoptiveFather = new AdjacencyMapSingular<PersonIdentity, PersonIdentity>("Person => Adoptive Father", identitiesPerson);
    const adjmapAdoptiveMother = new AdjacencyMapSingular<PersonIdentity, PersonIdentity>("Person => Adoptive Mother", identitiesPerson);

    const adjmapParents = new AdjacencyMapMultiple<PersonIdentity, PersonIdentity>("Person => Parents", identitiesPerson);
    const adjmapAdoptiveParents = new AdjacencyMapMultiple<PersonIdentity, PersonIdentity>("Person => Adoptive Parents", identitiesPerson);
     
    const adjmapChildren = new AdjacencyMapMultiple<PersonIdentity, PersonIdentity>("Person => Children", identitiesPerson);
    const adjmapAdoptedChildren = new AdjacencyMapMultiple<PersonIdentity, PersonIdentity>("Person => Adopted Children", identitiesPerson);

    const adjmapFullSiblings = new AdjacencyMapMultiple<PersonIdentity, PersonIdentity>("Person => Full Siblings", identitiesPerson);
    const adjmapAdoptiveFullSiblings = new AdjacencyMapMultiple<PersonIdentity, PersonIdentity>("Person => Adoptive Full Siblings", identitiesPerson);

    // populate adjacency maps - from marriages (pass #1)
    {
        for (const nodeMarriage of nodesMarriage) {
            const linkBride = graph.links.find((link)=>link.type === "Bride" && link.fromNodeIdentity === nodeMarriage.identity) as LBride | undefined;
            assert(linkBride);
            const linkGroom = graph.links.find((link)=>link.type === "Groom" && link.fromNodeIdentity === nodeMarriage.identity) as LGroom | undefined;
            assert(linkGroom);
            const bride = getFemaleNode(linkBride.toNodeIdentity);
            assert(bride);
            const groom = getMaleNode(linkGroom.toNodeIdentity);
            assert(groom);
            // add entries for person->marriages, marriage->groom, marriage->bride
            adjmapMarriages.set(groom.identity, nodeMarriage.identity);
            adjmapMarriages.set(bride.identity, nodeMarriage.identity);
            adjmapGroom.set(nodeMarriage.identity, groom.identity);
            adjmapBride.set(nodeMarriage.identity, bride.identity);
            // add entries for marital progeny
            const linksProgeny = graph.links.filter((link)=>link.type === "MaritalProgeny" && link.fromNodeIdentity === nodeMarriage.identity) as LMaritalProgeny[];
            for (const linkProgeny of linksProgeny) {
                const progeny = getPersonNode(linkProgeny.toNodeIdentity);
                assert(progeny);

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
            const linksAdoptedProgeny = graph.links.filter((link)=>link.type === "AdoptedMaritalProgeny" && link.fromNodeIdentity === nodeMarriage.identity) as LAdoptedMaritalProgeny[];
            for (const linkAdoptedProgeny of linksAdoptedProgeny) {
                const adoptedProgeny = getPersonNode(linkAdoptedProgeny.toNodeIdentity);
                assert(adoptedProgeny);
                adjmapAdoptedProgeny.set(nodeMarriage.identity, adoptedProgeny.identity);
                adjmapAdoptiveProgenitor.set(adoptedProgeny.identity, nodeMarriage.identity);

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
        for (const nodePerson of nodesPerson) {
            // populate adopted children (since children may be adopted independently, outside of marriage)
            const linksAdoptedChild = graph.links.filter((link)=>link.type === "AdoptedChild" && link.fromNodeIdentity === nodePerson.identity) as LAdoptedChild[];
            for (const linkAdoptedChild of linksAdoptedChild) {
                const adoptedChild = getPersonNode(linkAdoptedChild.toNodeIdentity);
                assert(adoptedChild);
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
        for (const nodeMarriage of nodesMarriage) {
            const progeny = adjmapProgeny.get(nodeMarriage.identity);
            const adoptedProgeny = adjmapAdoptedProgeny.get(nodeMarriage.identity);
            // populate for progeny
            for (const p of progeny) {
                const otherChildrenOfParents = progeny.filter((_p)=>_p !== p);
                const adoptedChildrenOfParents = adoptedProgeny;
                adjmapFullSiblings.set(p, ...otherChildrenOfParents);
                adjmapAdoptiveFullSiblings.set(p, ...adoptedChildrenOfParents);
            }
            // populate for adopted progeny
            for (const ap of adoptedProgeny) {
                const childrenOfParents = progeny;
                const otherAdoptedChildrenOfParents = adoptedProgeny.filter((_ap)=>_ap !== ap);
                adjmapAdoptiveFullSiblings.set(ap, ...childrenOfParents, ...otherAdoptedChildrenOfParents);
            }
        }
    }

    return {
        ...graph,
        nodesByType: {
            male: nodesMale,
            female: nodesFemale,
            person: nodesPerson,
            marriage: nodesMarriage,
        },
        adjacencyMaps: {
            byPerson: {
                marriages: adjmapMarriages,
                progenitor: adjmapProgenitor,
                adoptiveProgenitor: adjmapAdoptiveProgenitor,
                mother: adjmapMother,
                adoptiveMother: adjmapAdoptiveMother,
                father: adjmapFather,
                adoptiveFather: adjmapAdoptiveFather,
                parents: adjmapParents,
                adoptiveParents: adjmapAdoptiveParents,
                children: adjmapChildren,
                adoptedChildren: adjmapAdoptedChildren,
                fullSiblings: adjmapFullSiblings,
                adoptiveFullSiblings: adjmapAdoptiveFullSiblings
            },
            byMarriage: {
                groom: adjmapGroom,
                bride: adjmapBride,
                progeny: adjmapProgeny,
                adoptedProgeny: adjmapAdoptedProgeny,
            }
        }
    };
});
