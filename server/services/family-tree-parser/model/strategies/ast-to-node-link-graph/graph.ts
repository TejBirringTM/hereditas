type Node<Type extends string> = {
    identity: `${Lowercase<Type>}:${string}`,
    type: Type,
}

type Relationship<
    Type extends string,
    FromNodeType extends string,
    ToNodeType extends string
> = {
    // identity: `${Lowercase<Type>}:${string}`,
    fromNodeIdentity: `${Lowercase<FromNodeType>}:${string}`,
    toNodeIdentity: `${Lowercase<ToNodeType>}:${string}`,
    type: Type,
}

export type MaleNode = Node<"Male"> & {
    title: string,
};
export type FemaleNode = Node<"Female"> & {
    title: string,
};
export type MarriageNode = Node<"Marriage">;

export type AdoptedHeirLink = Relationship<"AdoptedHeir", "Male", "Male">

export type ProgenyLink = Relationship<"Progeny", "Marriage", "Male" | "Female">

export type MarriageGroomLink = Relationship<"Groom", "Male", "Marriage">;
export type MarriageBrideLink = Relationship<"Bride", "Female", "Marriage">;

export type Graph = {
    nodes: (MaleNode | FemaleNode | MarriageNode)[],
    links: (AdoptedHeirLink | ProgenyLink | MarriageBrideLink | MarriageGroomLink)[]
};
