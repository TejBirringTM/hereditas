import debugOnly from "../../../../../../framework/debug-only.ts";
import { declareTransformation } from "../../strategy.ts";
import {NPerson, NMale, NFemale, NMarriage, LGroom, LBride, LProgeny} from "../../../parse-ast/types.ts";
import {Graph} from "../graph.ts";
import { assert } from "@std/assert";
import assignGenerationNumbers from "./assign-generation-numbers.ts";

type Input = ReturnType<typeof assignGenerationNumbers["fn"]>;

export default declareTransformation("Append summary properties", (input: Input)=>{

    const transformed = {
        nodes: input.nodes.map((node)=>{
            if (node.type === "Male" || node.type === "Female") {
                const directLineageHighlightedNodesAndLinks = getDirectLineageHighlightedNodesAndLinks(input, node);
                const numOfMarriages = getNumOfMarriages(input, node);
                const numOfChildren = getNumOfChildren(input, node);
                const numOfAdoptedHeirs = getNumOfAdoptedHeirs(input, node);
                return {
                    ...node,
                    directLineageHighlightedNodesAndLinks,
                    numOfMarriages,
                    numOfChildren,
                    numOfAdoptedHeirs
                }
            } else {
                return node;
            }
        }),
        links: input.links,
    };

    debugOnly(()=>{
        console.dir(transformed);
    });

    return transformed;
});

function getDirectLineageHighlightedNodesAndLinks(graph: Graph, node: NPerson) {
    const highlightedNodes : (NPerson["identity"] | NMarriage["identity"])[] = [];
    const highlightedLinks : (LProgeny | LGroom | LBride)[] = [];

    let currentNode : NPerson | null = node;
    while (currentNode) {
        // 1. find progeny link
        const linkProgeny = graph.links.find((link)=>(link.type === "Progeny") && (link.toNodeIdentity === (currentNode as NPerson).identity)) as LProgeny | undefined;
        if (!linkProgeny) {
            currentNode = null;
        } else {
            // 2. identify marriage
            const nodeMarriage = graph.nodes.find((node)=>(node.type === "Marriage") && (node.identity === linkProgeny.fromNodeIdentity)) as NMarriage | undefined;
            assert(nodeMarriage);
            // 3. find groom link and bride link
            const linkGroom = graph.links.find((link)=>(link.type === "Groom") && (link.toNodeIdentity === nodeMarriage.identity)) as LGroom | undefined;
            assert(linkGroom);
            const linkBride = graph.links.find((link)=>(link.type === "Bride") && (link.toNodeIdentity === nodeMarriage.identity)) as LBride | undefined;
            assert(linkBride);
            // 4. identify father and mother
            const nodeFather = graph.nodes.find((node)=>(node.type === "Male") && (node.identity === linkGroom.fromNodeIdentity)) as NMale | undefined;
            assert(nodeFather);
            const nodeMother = graph.nodes.find((node)=>(node.type === "Female") && (node.identity === linkBride.fromNodeIdentity)) as NFemale | undefined;
            assert(nodeMother);
            // 5. add to list
            highlightedNodes.push(nodeMarriage.identity, nodeFather.identity, nodeMother.identity);
            highlightedLinks.push(linkProgeny, linkGroom, linkBride);
            // 6. update current node
            currentNode = nodeFather;
        }
    }

    return {
        nodes: highlightedNodes,
        links: highlightedLinks
    };
}

function getMarriages(graph: Graph, node: NPerson) {
    if (node.type === "Male") {
        return graph.links.filter((link)=>(link.type === "Groom" && link.fromNodeIdentity === node.identity));
    } else if (node.type === "Female") {
        return graph.links.filter((link)=>(link.type === "Bride" && link.fromNodeIdentity === node.identity));
    } else {
        return [];
    }
}

function getNumOfMarriages(graph: Graph, node: NPerson) {
    return getMarriages(graph, node).length;
}

function getNumOfChildren(graph: Graph, node: NPerson) {
    const links = graph.links.filter((link)=>(link.type === "ParentTo" && link.fromNodeIdentity === node.identity));
    return links.length;
}

function getNumOfAdoptedHeirs(graph: Graph, node: NPerson) {
    const links = graph.links.filter((link)=>(link.type === "AdoptedHeir" && link.fromNodeIdentity === node.identity));
    return links.length;
}

