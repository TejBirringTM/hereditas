type Node<Type extends string> = {
    identity: `${Lowercase<Type>}:${string}`,
    type: Type
}

type Relationship<
    Type extends string,
    FromNodeType extends string,
    ToNodeType extends string
> = {
    // identity: `link(${Lowercase<Type>}):${string}`,
    fromNodeIdentity: `${Lowercase<FromNodeType>}:${string}`,
    toNodeIdentity: `${Lowercase<ToNodeType>}:${string}`,
    type: Type,
}

export type NMale = Node<"Male"> & {
    title: string,
};
export type NFemale = Node<"Female"> & {
    title: string,
};
export type NMarriage = Node<"Marriage">;

// Marriage and Spousal Links
export type LGroom = Relationship<"Groom", "Male", "Marriage">;
export type LBride = Relationship<"Bride", "Female", "Marriage">;
export type LMarriage = LGroom | LBride;

export type LHusbandTo = Relationship<"HusbandTo", "Male", "Female">;
export type LWifeTo = Relationship<"WifeTo", "Female", "Male">;
export type LSpouse = LHusbandTo | LWifeTo;

// Marriage Progeny, Children
export type LProgeny = Relationship<"Progeny", "Marriage", "Male" | "Female">;
// export type LFatherTo = Relationship<"FatherTo", "Male", "Male" | "Female">;
// export type LMotherTo = Relationship<"MotherTo", "Female", "Male" | "Female">;
// export type LParentTo = LFatherTo | LMotherTo;
export type LExplicitParentTo = Relationship<"ParentTo", "Male" | "Female", "Male" | "Female">;

// Parentage
export type LExplicitChildTo = Relationship<"ChildTo", "Male" | "Female", "Male" | "Female">;

// Adopted Heir (Matbannā)
export type LAdoptedHeir = Relationship<"AdoptedHeir", "Male", "Male">;

// People Nodes
export type NPerson = NMale | NFemale;

// All Nodes
export type AnyNode = NMale | NFemale | NMarriage;

// All Links
export type AnyLink = LMarriage | LSpouse | LProgeny | LExplicitParentTo | LExplicitChildTo | LAdoptedHeir;

export type FamilyTreeContext = {
    maleNodes: Map<NMale["identity"], NMale>,
    femaleNodes: Map<NFemale["identity"], NFemale>,
    marriageNodes: Map<NMarriage["identity"], NMarriage>,
    links: Array<AnyLink>;
}
