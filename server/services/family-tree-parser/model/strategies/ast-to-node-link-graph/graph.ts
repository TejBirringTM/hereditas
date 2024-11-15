import { AnyLink, AnyNode, FamilyTreeContext } from "../../parse-ast/types.ts";

export type Graph = {
    nodes: AnyNode[],
    links: AnyLink[]
}

export function graphFromFamilyTreeContext(context: FamilyTreeContext) {
    return Object.freeze({
        nodes: [...context.maleNodes.values(), ...context.femaleNodes.values(), ...context.marriageNodes.values()],
        links: context.links
    }) satisfies Graph;
}
