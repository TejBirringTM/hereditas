
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

const treeMaleBaseSchema = v.object({
    identity: v.string(),
    title: v.string(),
    text: v.array(v.string()),
    gender: v.literal("Male"),
    generationInClan: v.optional(v.number())
});
const treeFemaleBaseSchema = v.object({
    identity: v.string(),
    title: v.string(),
    text: v.array(v.string()),
    gender: v.literal("Female"), 
    generationInClan: v.optional(v.number())
});
type TreeMaleBase = v.InferInput<typeof treeMaleBaseSchema>;
type TreeFemaleBase = v.InferInput<typeof treeFemaleBaseSchema>;
export type TreeMale = TreeMaleBase & {
    marriages: TreeMarriage[]
};
export type TreeFemale = TreeFemaleBase & {
    marriages: TreeMarriage[]
};
export type TreeMarriage = {
    groom: TreeMaleBase,
    bride: TreeFemaleBase,
    progeny: Array<TreeMale | TreeFemale>,
    adoptedProgeny: Array<TreeMale | TreeFemale>,
    expanded?: boolean
}

const marriageSchema : v.GenericSchema<TreeMarriage> = v.pipe(
    v.object({
    groom: treeMaleBaseSchema,
    bride: treeFemaleBaseSchema,
    progeny: v.array(v.union([
        v.object({
            ...treeMaleBaseSchema.entries,
            marriages: v.array(v.lazy(()=>marriageSchema))
        }),
        v.object({
            ...treeFemaleBaseSchema.entries,
            marriages: v.array(v.lazy(()=>marriageSchema))
        })
    ])),
    adoptedProgeny: v.array(v.union([
        v.object({
            ...treeMaleBaseSchema.entries,
            marriages: v.array(v.lazy(()=>marriageSchema))
        }),
        v.object({
            ...treeFemaleBaseSchema.entries,
            marriages: v.array(v.lazy(()=>marriageSchema))
        })
    ])),
    expanded: v.optional(v.boolean()),
    }),
    v.rawTransform((ctx)=>{
        ctx.dataset.value.expanded = false;
        return ctx.dataset.value;
    })
);

export const treeSchema = v.array(
    v.object({
        ...treeMaleBaseSchema.entries,
        marriages: v.array(marriageSchema)
    }
));
export type Tree = v.InferInput<typeof treeSchema>;

export type Node = v.InferInput<typeof nodeSchema>;
export type NodeType = Node["type"];

export type Link = v.InferInput<typeof linkSchema>;
export type LinkType = Link["type"];

export type Stats = v.InferInput<typeof statsSchema>;
