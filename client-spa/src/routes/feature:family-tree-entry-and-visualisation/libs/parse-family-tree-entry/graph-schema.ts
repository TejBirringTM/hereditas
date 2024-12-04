
import * as v from "valibot";

const baseNodeSchema = v.object({
    identity: v.string(),
    type: v.union([v.literal("Male"), v.literal("Female"), v.literal("Marriage")]),
    generation: v.number(),
    title: v.optional(v.string()),
});

export const linkSchema = v.object({
    fromNodeIdentity: v.string(),
    toNodeIdentity: v.string(),
    type: v.union([
        v.literal("Bride"),
        v.literal("Groom"),
        v.literal("AdoptedHeir"),
        v.literal("Progeny")
    ]),
});

export const nodeSchema = v.object({
    ...baseNodeSchema.entries,
    directLineageHighlightedNodesAndLinks: v.optional(v.object({
        nodes: v.array(baseNodeSchema.entries.identity),
        links: v.array(linkSchema)
    })),
    numOfMarriages: v.optional(v.number()),
    numOfChildren: v.optional(v.number()),
    numOfAdoptedHeirs: v.optional(v.number())
})

export type Node = v.InferInput<typeof nodeSchema>;
export type NodeType = Node["type"];

export type Link = v.InferInput<typeof linkSchema>;
export type LinkType = Link["type"];