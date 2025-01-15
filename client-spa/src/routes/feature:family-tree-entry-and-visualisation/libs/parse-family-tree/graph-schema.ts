
import * as v from "valibot";

const baseNodeSchema = v.object({
    identity: v.string(),
    type: v.union([v.literal("Male"), v.literal("Female"), v.literal("Marriage")]),
    generationInTree: v.number(),
    generationInClan: v.optional(v.number()),
    title: v.optional(v.string()),
    text: v.array(v.string()),
});

export const linkSchema = v.object({
    fromNodeIdentity: v.string(),
    toNodeIdentity: v.string(),
    type: v.union([
        v.literal("Bride"),
        v.literal("Groom"),
        v.literal("MaritalProgeny"),
        v.literal("AdoptedMaritalProgeny"),
        v.literal("Parent"),
        v.literal("AdoptiveParent"),
        v.literal("Child"),
        v.literal("AdoptedChild")
    ]),
});

export const nodeSchema = v.object({
    ...baseNodeSchema.entries,
    patrilineage: v.optional(v.object({
        nodes: v.array(baseNodeSchema.entries.identity),
        links: v.array(linkSchema),
    })),
    rootAncestor: v.optional(baseNodeSchema)
})

export const statsSchema = v.object({
    rootNodes: v.array(v.string()),
    nRootNodes: v.number()
});

export type Node = v.InferInput<typeof nodeSchema>;
export type NodeType = Node["type"];

export type Link = v.InferInput<typeof linkSchema>;
export type LinkType = Link["type"];

export type Stats = v.InferInput<typeof statsSchema>;
